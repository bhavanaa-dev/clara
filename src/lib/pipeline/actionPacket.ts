/**
 * Pipeline Step 6: Action packet generation
 * Synthesises all previous pipeline outputs into an action packet.
 * The disclaimer is injected by code — never by the LLM.
 */
import { generateJson } from '@/lib/ai/provider';
import {
  buildActionPacketPrompt,
  CLARA_DISCLAIMER,
} from '@/lib/gemini/prompts';
import type {
  ActionPacket,
  ExtractedFact,
  VerificationResult,
  CorpusProvision,
  LegalInfoItem,
  TimelineEntry,
} from '@/lib/types';

import { parseJsonSafely } from './parseModelJson';

export async function generateActionPacket(
  facts: ExtractedFact[],
  verificationResults: VerificationResult[],
  relevantProvisions: CorpusProvision[],
  timeline: TimelineEntry[],
  evidenceSummaries: string[]
): Promise<ActionPacket> {
  const promptText = buildActionPacketPrompt(
    JSON.stringify(facts, null, 2),
    JSON.stringify(verificationResults, null, 2),
    JSON.stringify(
      relevantProvisions.map((p) => ({
        id: p.id,
        actName: p.actName,
        sectionRef: p.sectionRef,
        title: p.title,
        plainLanguageSummary: p.plainLanguageSummary,
      })),
      null,
      2
    )
  );

  const raw = await generateJson({
    user: promptText,
    temperature: 0.2,
  });

  type RawPacket = {
    caseSummary: string;
    evidenceSummary: string[];
    missingInformation: string[];
    recommendedNextStep: string;
    draftRepairRequest: string;
  };

  let rawPacket: RawPacket;
  try {
    rawPacket = parseJsonSafely<RawPacket>(raw, 'action packet');
  } catch {
    rawPacket = {
      caseSummary: 'Unable to generate case summary.',
      evidenceSummary: evidenceSummaries,
      missingInformation: [],
      recommendedNextStep: 'Please consult a qualified advocate for guidance.',
      draftRepairRequest: '',
    };
  }

  // Map corpus provisions to LegalInfoItem — sourced deterministically, not from LLM
  const legalInfoItems: LegalInfoItem[] = relevantProvisions.map((p) => ({
    provisionId: p.id,
    actName: p.actName,
    sectionRef: p.sectionRef,
    title: p.title,
    plainLanguageSummary: p.plainLanguageSummary,
    sourceUrl: p.officialSourceUrl,
    relevanceReason: `This provision is relevant to the reported issue regarding ${p.topic}.`,
  }));

  return {
    generatedAt: new Date().toISOString(),
    caseSummary: rawPacket.caseSummary,
    timeline,
    evidenceSummary: rawPacket.evidenceSummary ?? evidenceSummaries,
    relevantLegalInfo: legalInfoItems,
    verificationSummary: verificationResults,
    missingInformation: rawPacket.missingInformation ?? [],
    recommendedNextStep: rawPacket.recommendedNextStep,
    draftRepairRequest: rawPacket.draftRepairRequest,
    // Disclaimer is ALWAYS injected by code, never by the LLM
    disclaimer: CLARA_DISCLAIMER,
  };
}
