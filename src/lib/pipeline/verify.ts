/**
 * Pipeline Step 5: Evidence-to-provision verification
 * Gemini verifies each extracted fact against corpus provisions.
 * The LLM is explicitly instructed NOT to use legal knowledge beyond supplied provisions.
 */
import { generateJson } from '@/lib/ai/provider';
import { buildVerificationPrompt } from '@/lib/gemini/prompts';
import type {
  ExtractedFact,
  VerificationResult,
  CorpusProvision,
  VerificationStatus,
  ApplicabilityStatus,
} from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

import { parseJsonSafely } from './parseModelJson';

export async function verifyFacts(
  facts: ExtractedFact[],
  provisions: CorpusProvision[]
): Promise<VerificationResult[]> {
  if (facts.length === 0) return [];

  const promptText = buildVerificationPrompt(facts, provisions);

  const raw = await generateJson({
    user: promptText,
    temperature: 0.1,
  });

  type RawResult = {
    claimId: string;
    claim: string;
    status: VerificationStatus;
    sourceProvisionId?: string;
    sourceProvisionTitle?: string;
    sourceText?: string;
    sourceUrl?: string;
    reasoning: string;
    confidence: string;
    missingInformation?: string;
    applicabilityStatus: ApplicabilityStatus;
  };

  let rawResults: RawResult[] = [];
  try {
    rawResults = parseJsonSafely<RawResult[]>(raw, 'verification');
  } catch {
    // Return all facts as INSUFFICIENT_INFORMATION if parsing fails
    return facts.map((f) => ({
      id: uuidv4(),
      claimId: f.id,
      claim: f.claim,
      status: 'INSUFFICIENT_INFORMATION' as VerificationStatus,
      reasoning: 'Verification could not be completed due to a processing error.',
      confidence: 'LOW' as const,
      applicabilityStatus: 'UNCERTAIN' as ApplicabilityStatus,
    }));
  }

  // Optional fields are omitted (not assigned `undefined`) when the model
  // provides no value — Firestore rejects `undefined` document values.
  // This matches the fallback path above, which omits these keys entirely.
  return rawResults.map((r) => ({
    id: uuidv4(),
    claimId: r.claimId,
    claim: r.claim,
    status: r.status ?? 'INSUFFICIENT_INFORMATION',
    ...(r.sourceProvisionId !== undefined ? { sourceProvisionId: r.sourceProvisionId } : {}),
    ...(r.sourceProvisionTitle !== undefined
      ? { sourceProvisionTitle: r.sourceProvisionTitle }
      : {}),
    ...(r.sourceText !== undefined ? { sourceText: r.sourceText } : {}),
    ...(r.sourceUrl !== undefined ? { sourceUrl: r.sourceUrl } : {}),
    reasoning: r.reasoning ?? '',
    confidence: (r.confidence as VerificationResult['confidence']) ?? 'LOW',
    ...(r.missingInformation !== undefined ? { missingInformation: r.missingInformation } : {}),
    applicabilityStatus: r.applicabilityStatus ?? 'UNCERTAIN',
  }));
}
