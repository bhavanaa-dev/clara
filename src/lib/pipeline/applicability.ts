/**
 * Pipeline Step 3+4: Applicability analysis
 * Uses deterministic corpus lookup + Gemini reasoning (grounded in corpus only).
 */
import { generateJson } from '@/lib/ai/provider';
import {
  buildCorpusQueryPrompt,
  buildApplicabilityPrompt,
} from '@/lib/gemini/prompts';
import { retrieveRelevantProvisions } from '@/lib/corpus/loader';
import type { ApplicabilityResult, ExtractedFact, CorpusProvision } from '@/lib/types';

import { parseJsonSafely } from './parseModelJson';

export async function analyseApplicability(
  facts: ExtractedFact[],
  userNarrative: string
): Promise<{ applicability: ApplicabilityResult; relevantProvisions: CorpusProvision[] }> {
  const factsText = JSON.stringify(facts, null, 2);

  // Step 3: Ask the model to formulate corpus search terms
  const queryPromptText = buildCorpusQueryPrompt(factsText);
  const queryText = await generateJson({
    user: queryPromptText,
    temperature: 0.1,
  });

  let searchTerms: string[] = [];
  try {
    searchTerms = parseJsonSafely<string[]>(queryText, 'corpus query');
  } catch {
    // Fallback: derive terms from issue type in narrative
    searchTerms = ['repair', 'landlord', 'notice', 'maintenance'];
  }

  // Step 3 (deterministic): Retrieve relevant provisions from corpus
  const relevantProvisions = retrieveRelevantProvisions(searchTerms);

  // Step 4: Applicability reasoning — grounded in corpus provisions only
  const applicabilityPromptText = buildApplicabilityPrompt(factsText, relevantProvisions);
  const appText = await generateJson({
    user: applicabilityPromptText,
    temperature: 0.1,
  });

  let applicability: ApplicabilityResult;
  try {
    applicability = parseJsonSafely<ApplicabilityResult>(
      appText,
      'applicability'
    );
  } catch {
    applicability = {
      status: 'UNCERTAIN',
      reasons: ['Unable to determine applicability from the supplied information.'],
      limitations: ['Consult a qualified advocate for a definitive assessment.'],
      checkedProvisions: relevantProvisions.map((p) => p.id),
    };
  }

  return { applicability, relevantProvisions };
}
