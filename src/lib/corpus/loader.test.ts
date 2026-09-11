import { describe, expect, it } from 'vitest';
import {
  getAllProvisions,
  getProvisionById,
  retrieveRelevantProvisions,
  searchProvisions,
} from './loader';

describe('corpus loader', () => {
  it('loads provisions with ids and keyword lists', () => {
    const all = getAllProvisions();
    expect(all.length).toBeGreaterThan(0);
    for (const p of all) {
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
      expect(Array.isArray(p.keywords)).toBe(true);
    }
  });

  it('finds a provision by id and misses unknown ids', () => {
    const all = getAllProvisions();
    const found = getProvisionById(all[0].id);
    expect(found?.id).toBe(all[0].id);
    expect(getProvisionById('NO-SUCH-PROVISION')).toBeUndefined();
  });
});

describe('searchProvisions', () => {
  it('matches provisions by keyword overlap', () => {
    const results = searchProvisions(['repair']);
    expect(results.length).toBeGreaterThan(0);
    for (const p of results) {
      const keywords = p.keywords.map((k) => k.toLowerCase());
      expect(
        keywords.some((kw) => kw.includes('repair') || 'repair'.includes(kw))
      ).toBe(true);
    }
  });

  it('matches case-insensitively', () => {
    const lower = searchProvisions(['repair']).map((p) => p.id).sort();
    const upper = searchProvisions(['REPAIR']).map((p) => p.id).sort();
    expect(upper).toEqual(lower);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchProvisions(['zzz-no-such-keyword-xyz'])).toEqual([]);
  });
});

describe('retrieveRelevantProvisions', () => {
  it('returns at least the keyword matches', () => {
    const matched = new Set(searchProvisions(['repair']).map((p) => p.id));
    const relevant = retrieveRelevantProvisions(['repair']);
    for (const id of matched) {
      expect(relevant.map((p) => p.id)).toContain(id);
    }
  });
});
