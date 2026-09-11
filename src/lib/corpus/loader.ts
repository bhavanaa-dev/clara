/**
 * Corpus loader — deterministic, read-only access to the trusted legal corpus.
 * The LLM never generates or modifies corpus content.
 * This module runs server-side only.
 */
import path from 'path';
import fs from 'fs';
import type { CorpusProvision, CorpusCategory } from '@/lib/types';

interface CorpusFile {
  version: string;
  lastVerified: string;
  notice: string;
  provisions: CorpusProvision[];
}

let _corpus: CorpusFile | null = null;

function loadCorpus(): CorpusFile {
  if (_corpus) return _corpus;
  const corpusPath = path.join(process.cwd(), 'corpus', 'karnataka-rent-act.json');
  const raw = fs.readFileSync(corpusPath, 'utf-8');
  _corpus = JSON.parse(raw) as CorpusFile;
  return _corpus;
}

/** Return all provisions */
export function getAllProvisions(): CorpusProvision[] {
  return loadCorpus().provisions;
}

/** Return a provision by its ID */
export function getProvisionById(id: string): CorpusProvision | undefined {
  return loadCorpus().provisions.find((p) => p.id === id);
}

/** Return provisions matching one or more categories */
export function getProvisionsByCategory(
  categories: CorpusCategory[]
): CorpusProvision[] {
  return loadCorpus().provisions.filter((p) => categories.includes(p.category));
}

/**
 * Keyword-based retrieval — returns provisions whose keywords overlap with
 * the supplied terms. Case-insensitive.
 */
export function searchProvisions(terms: string[]): CorpusProvision[] {
  const lower = terms.map((t) => t.toLowerCase());
  return loadCorpus().provisions.filter((p) => {
    const provisionKeywords = p.keywords.map((k) => k.toLowerCase());
    return lower.some((term) =>
      provisionKeywords.some((kw) => kw.includes(term) || term.includes(kw))
    );
  });
}

/**
 * Returns the subset of provisions most relevant to a given set of concepts.
 * Used by the pipeline to assemble the context passed to Gemini for verification.
 */
export function retrieveRelevantProvisions(concepts: string[]): CorpusProvision[] {
  const byKeyword = searchProvisions(concepts);
  // Always include the scope provision so Gemini understands applicability context
  const scopeProvision = getProvisionById('KRC-1961-SCOPE');
  const ids = new Set(byKeyword.map((p) => p.id));
  if (scopeProvision && !ids.has(scopeProvision.id)) {
    return [scopeProvision, ...byKeyword];
  }
  return byKeyword;
}

export function getCorpusNotice(): string {
  return loadCorpus().notice;
}
