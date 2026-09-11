import { describe, expect, it } from 'vitest';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_CASE,
  sanitiseExtractedText,
  validateBase64Size,
  validateFileCount,
  validateFileSize,
  validateMimeType,
} from './fileValidator';

describe('validateMimeType', () => {
  it('accepts an allowed image type', () => {
    expect(validateMimeType('image/jpeg')).toEqual({ valid: true });
  });

  it('accepts PDF and plain text', () => {
    expect(validateMimeType('application/pdf').valid).toBe(true);
    expect(validateMimeType('text/plain').valid).toBe(true);
  });

  it('rejects a disallowed type with a helpful error', () => {
    const result = validateMimeType('application/zip');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/application\/zip/);
  });

  it('rejects an empty mime type', () => {
    expect(validateMimeType('').valid).toBe(false);
  });
});

describe('validateFileSize', () => {
  it('accepts a file exactly at the limit', () => {
    expect(validateFileSize(MAX_FILE_SIZE_BYTES)).toEqual({ valid: true });
  });

  it('accepts an empty file', () => {
    expect(validateFileSize(0).valid).toBe(true);
  });

  it('rejects a file one byte over the limit', () => {
    const result = validateFileSize(MAX_FILE_SIZE_BYTES + 1);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exceeds/);
  });
});

describe('validateFileCount', () => {
  it('accepts zero files', () => {
    expect(validateFileCount(0)).toEqual({ valid: true });
  });

  it('accepts exactly the maximum', () => {
    expect(validateFileCount(MAX_FILES_PER_CASE).valid).toBe(true);
  });

  it('rejects one file over the maximum', () => {
    const result = validateFileCount(MAX_FILES_PER_CASE + 1);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Maximum/);
  });
});

describe('sanitiseExtractedText', () => {
  it('strips null bytes and control characters', () => {
    expect(sanitiseExtractedText('a\x00b\x07c\x1F')).toBe('abc');
  });

  it('strips DEL but keeps newlines and tabs', () => {
    expect(sanitiseExtractedText('line1\nline2\ttab\x7F')).toBe('line1\nline2\ttab');
  });

  it('leaves normal and non-ASCII printable text untouched', () => {
    const text = 'Leak since Aug 20th — wall damaged ₹5000';
    expect(sanitiseExtractedText(text)).toBe(text);
  });
});

describe('validateBase64Size', () => {
  it('accepts a small payload', () => {
    expect(validateBase64Size('aGVsbG8=').valid).toBe(true);
  });

  it('rejects a payload whose decoded size exceeds the limit', () => {
    const oversized = 'a'.repeat(Math.ceil((MAX_FILE_SIZE_BYTES * 4) / 3) + 16);
    expect(validateBase64Size(oversized).valid).toBe(false);
  });
});
