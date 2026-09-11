/**
 * Pipeline Step 1+2: Evidence extraction
 * Calls Gemini with the user narrative (and image descriptions).
 * Returns structured extracted facts.
 */
import { getGeminiClient, GEMINI_MODEL_VISION } from '@/lib/gemini/client';
import {
  generateJson,
  isGeminiConfigured,
} from '@/lib/ai/provider';
import { buildExtractionPrompt, buildNormalizationPrompt } from '@/lib/gemini/prompts';
import type {
  EvidenceItem,
  ExtractedFact,
  TimelineEntry,
  IssueType,
  Severity,
} from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { sanitiseExtractedText } from '@/lib/security/fileValidator';

export interface ExtractionOutput {
  issueType: IssueType;
  issueTypeLabel: string;
  severity: Severity;
  tenantName?: string;
  landlordName?: string;
  propertyAddress?: string;
  landlordNotified: boolean;
  landlordResponse?: string;
  timeline: TimelineEntry[];
  extractedFacts: ExtractedFact[];
  missingInformation: string[];
}

import { parseJsonSafely } from './parseModelJson';

/**
 * Extraction via the active AI provider (NVIDIA primary, Gemini fallback).
 * Text-only: attachments are represented by their descriptions, and image
 * files without vision support are flagged so the model does not invent
 * observations about them.
 */
async function extractViaProvider(
  userNarrative: string,
  evidenceItems: EvidenceItem[]
): Promise<string> {
  const attachmentNotes = evidenceItems.map(
    (e) =>
      `- [${e.type}] ${e.fileName ?? 'unnamed file'} (${e.mimeType ?? 'unknown type'}): ${e.description}`
  );
  const attachmentsBlock =
    attachmentNotes.length > 0
      ? `\n\nATTACHED EVIDENCE FILES (metadata only — describe only what is stated, do not invent visual content):\n${attachmentNotes.join('\n')}`
      : '';

  return generateJson({
    user: buildExtractionPrompt(
      sanitiseExtractedText(userNarrative) + attachmentsBlock
    ),
    temperature: 0.1,
  });
}

/**
 * Extraction via Gemini vision (multimodal). Used only when image evidence
 * is present and a Gemini key is configured, since the NVIDIA text models
 * do not accept image input.
 */
async function extractViaGeminiVision(
  userNarrative: string,
  imageItems: EvidenceItem[]
): Promise<string> {
  const client = getGeminiClient();

  // Build multimodal content parts
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    { text: buildExtractionPrompt(sanitiseExtractedText(userNarrative)) },
  ];

  // Attach image evidence as inline data
  for (const item of imageItems) {
    parts.push({
      inlineData: {
        mimeType: item.mimeType as string,
        data: item.contentBase64 as string,
      },
    });
  }

  const response = await client.models.generateContent({
    model: GEMINI_MODEL_VISION,
    contents: [{ role: 'user', parts }],
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  return response.text ?? '';
}

export async function extractEvidence(
  userNarrative: string,
  evidenceItems: EvidenceItem[]
): Promise<ExtractionOutput> {
  // Attach image evidence as inline data — only supported via Gemini vision.
  // The NVIDIA text path describes attachments as text instead (see below).
  const imageItems = evidenceItems.filter(
    (e) => e.contentBase64 && e.mimeType?.startsWith('image/')
  );
  const useVision = imageItems.length > 0 && isGeminiConfigured();

  let rawText: string;
  if (useVision) {
    rawText = await extractViaGeminiVision(userNarrative, imageItems);
  } else {
    rawText = await extractViaProvider(userNarrative, evidenceItems);
  }
  const extracted = parseJsonSafely<{
    issueType: IssueType;
    issueTypeLabel: string;
    severity: Severity;
    tenantName?: string;
    landlordName?: string;
    propertyAddress?: string;
    landlordNotified: boolean | null;
    landlordResponse?: string;
    timeline: Array<{
      date: string;
      dateIsApproximate: boolean;
      event: string;
      source: string;
    }>;
    extractedFacts: Array<{
      claim: string;
      source: string;
      confidence: string;
      isAmbiguous: boolean;
      ambiguityNote?: string;
    }>;
    missingInformation: string[];
  }>(rawText, 'evidence extraction');

  // Build additional evidence descriptions for normalisation (non-image files)
  const additionalDescriptions = evidenceItems
    .filter((e) => !e.mimeType?.startsWith('image/'))
    .map((e) => `${e.type}: ${e.description} (${e.mimeType ?? 'unknown type'})`);

  // Normalise via the active provider (deterministic corpus steps unaffected)
  const normPrompt = buildNormalizationPrompt(
    JSON.stringify(extracted, null, 2),
    additionalDescriptions
  );
  const normRaw = await generateJson({
    user: normPrompt,
    temperature: 0.1,
  });
  const normalised = parseJsonSafely<typeof extracted>(normRaw, 'normalisation');

  // Map to typed output.
  // Optional fields are omitted (not assigned `undefined`) when the model
  // provides no value — Firestore rejects `undefined` document values.
  return {
    issueType: normalised.issueType ?? 'OTHER',
    issueTypeLabel: normalised.issueTypeLabel ?? 'Other Issue',
    severity: normalised.severity ?? 'MEDIUM',
    ...(normalised.tenantName !== undefined ? { tenantName: normalised.tenantName } : {}),
    ...(normalised.landlordName !== undefined ? { landlordName: normalised.landlordName } : {}),
    ...(normalised.propertyAddress !== undefined
      ? { propertyAddress: normalised.propertyAddress }
      : {}),
    landlordNotified: normalised.landlordNotified === true,
    ...(normalised.landlordResponse !== undefined
      ? { landlordResponse: normalised.landlordResponse }
      : {}),
    timeline: (normalised.timeline ?? []).map((t) => ({
      id: uuidv4(),
      date: t.date,
      dateIsApproximate: t.dateIsApproximate ?? false,
      event: t.event,
      source: t.source as ExtractedFact['source'],
    })),
    extractedFacts: (normalised.extractedFacts ?? []).map((f) => ({
      id: uuidv4(),
      claim: f.claim,
      source: f.source as ExtractedFact['source'],
      confidence: f.confidence as ExtractedFact['confidence'],
      isAmbiguous: f.isAmbiguous ?? false,
      // Optional field: omit the key when the model provides no note.
      // Assigning `undefined` would make Firestore reject the whole
      // document ("Cannot use undefined as a Firestore value").
      ...(f.ambiguityNote !== undefined ? { ambiguityNote: f.ambiguityNote } : {}),
    })),
    missingInformation: normalised.missingInformation ?? [],
  };
}
