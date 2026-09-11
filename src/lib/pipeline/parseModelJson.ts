/**
 * Shared model-JSON parser for the pipeline (server-side only).
 *
 * Text models (e.g. NVIDIA Nemotron) sometimes wrap JSON in Markdown fences
 * or surround it with explanatory prose, even when asked for pure JSON.
 * This normalises the raw completion before parsing:
 *   1. trim whitespace
 *   2. unwrap ```json ... ``` / ``` ... ``` fenced blocks (first block wins)
 *   3. try parsing the whole text as JSON
 *   4. otherwise extract the first valid top-level JSON object or array
 *      (string-aware brace/bracket scan, first successful parse wins)
 *
 * On failure it throws a clear error with a short, whitespace-collapsed
 * preview of the model output (no keys or secrets are ever included —
 * callers must not pass credentials in `raw`).
 */
export function parseJsonSafely<T>(raw: string, context: string): T {
  const text = (raw ?? '').trim();

  // 1) Prefer the first fenced code block if the model used fences anywhere.
  const fenced = extractFirstFencedBlock(text);
  const candidates: string[] = [];
  if (fenced !== null) candidates.push(fenced);
  candidates.push(text);

  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    // 2) Whole-text parse (covers pure JSON responses).
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      // fall through to fragment extraction
    }
    // 3) First valid top-level object/array embedded in prose.
    const fragment = extractFirstJsonFragment(trimmed);
    if (fragment !== null) {
      return fragment as T;
    }
  }

  throw new Error(
    `Failed to parse model JSON for ${context}: no valid JSON object or array found. Preview: "${preview(text)}"`
  );
}

/** Return the contents of the first ``` fenced block, or null. */
function extractFirstFencedBlock(text: string): string | null {
  const open = /```(?:json)?[ \t]*\r?\n?/i.exec(text);
  if (!open || open.index === undefined) return null;
  const start = open.index + open[0].length;
  const close = text.indexOf('```', start);
  const inner = (close === -1 ? text.slice(start) : text.slice(start, close)).trim();
  return inner ? inner : null;
}

/**
 * Scan for the first substring that parses as a top-level JSON object or
 * array. String-aware (handles escaped quotes) so braces inside strings
 * don't break depth counting. Tries each balanced candidate in order and
 * returns the first one that JSON.parse accepts.
 */
function extractFirstJsonFragment(text: string): unknown | null {
  const maxCandidates = 20;
  let tried = 0;
  for (let i = 0; i < text.length; i++) {
    const open = text[i];
    if (open !== '{' && open !== '[') continue;
    const close = open === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let j = i; j < text.length; j++) {
      const ch = text[j];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }
      if (ch === '"') {
        inString = true;
      } else if (ch === open) {
        depth++;
      } else if (ch === close) {
        depth--;
        if (depth === 0) {
          const snippet = text.slice(i, j + 1);
          try {
            return JSON.parse(snippet) as unknown;
          } catch {
            break; // balanced but not valid JSON — try next start
          }
        }
      }
    }
    tried++;
    if (tried >= maxCandidates) return null;
  }
  return null;
}

/** Short single-line preview for error messages (no secrets possible here). */
function preview(text: string): string {
  return text.replace(/\s+/g, ' ').slice(0, 200);
}
