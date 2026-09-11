import { describe, expect, it } from 'vitest';
import { parseJsonSafely } from './parseModelJson';

describe('parseJsonSafely', () => {
  it('parses a pure JSON object', () => {
    expect(parseJsonSafely<{ a: number }>('{"a": 1}', 'test')).toEqual({ a: 1 });
  });

  it('parses a pure top-level JSON array', () => {
    expect(parseJsonSafely<string[]>('["repair", "notice"]', 'test')).toEqual([
      'repair',
      'notice',
    ]);
  });

  it('trims surrounding whitespace', () => {
    expect(parseJsonSafely<{ ok: boolean }>('  \n {"ok": true} \n ', 'test')).toEqual({
      ok: true,
    });
  });

  it('unwraps ```json fenced blocks', () => {
    const raw = '```json\n{"issueType": "REPAIR"}\n```';
    expect(parseJsonSafely<{ issueType: string }>(raw, 'test')).toEqual({
      issueType: 'REPAIR',
    });
  });

  it('unwraps plain ``` fenced blocks with surrounding prose', () => {
    const raw =
      "Here's my analysis:\n```\n{\"a\": [1, 2]}\n```\nHope this helps.";
    expect(parseJsonSafely<{ a: number[] }>(raw, 'test')).toEqual({ a: [1, 2] });
  });

  it('extracts a bare JSON object embedded in prose', () => {
    const raw = 'Sure, here is the result: {"a": 1, "b": "x"} done.';
    expect(parseJsonSafely<{ a: number; b: string }>(raw, 'test')).toEqual({
      a: 1,
      b: 'x',
    });
  });

  it('extracts a bare top-level array embedded in prose', () => {
    const raw = 'Results:\n[{"claim": "leak"}, {"claim": "notice"}]\nEnd.';
    expect(parseJsonSafely<Array<{ claim: string }>>(raw, 'test')).toEqual([
      { claim: 'leak' },
      { claim: 'notice' },
    ]);
  });

  it('ignores braces inside JSON strings when scanning', () => {
    const raw = 'Output: {"a": [1, 2, {"b": "x}"}]} trailing text';
    expect(parseJsonSafely<{ a: unknown[] }>(raw, 'test')).toEqual({
      a: [1, 2, { b: 'x}' }],
    });
  });

  it('throws a clear error with a preview for non-JSON prose', () => {
    const raw = "Here's my summary with no json at all";
    expect(() => parseJsonSafely(raw, 'evidence extraction')).toThrowError(
      /Failed to parse model JSON for evidence extraction.*Preview: "Here's my summary/
    );
  });

  it('throws for empty input', () => {
    expect(() => parseJsonSafely('', 'test')).toThrowError(
      /Failed to parse model JSON for test/
    );
  });
});
