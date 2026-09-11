/**
 * Security utilities for file validation.
 * All uploaded files are treated as untrusted.
 */

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
]);

export const MAX_FILE_SIZE_BYTES =
  parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10) * 1024 * 1024;

export const MAX_FILES_PER_CASE =
  parseInt(process.env.MAX_FILES_PER_CASE ?? '5', 10);

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateMimeType(mimeType: string): ValidationResult {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      valid: false,
      error: `File type '${mimeType}' is not allowed. Accepted types: JPEG, PNG, WebP, GIF, PDF, plain text.`,
    };
  }
  return { valid: true };
}

export function validateFileSize(sizeBytes: number): ValidationResult {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return {
      valid: false,
      error: `File size ${(sizeBytes / (1024 * 1024)).toFixed(1)} MB exceeds the ${maxMb} MB limit.`,
    };
  }
  return { valid: true };
}

export function validateFileCount(count: number): ValidationResult {
  if (count > MAX_FILES_PER_CASE) {
    return {
      valid: false,
      error: `Too many files. Maximum ${MAX_FILES_PER_CASE} files per case.`,
    };
  }
  return { valid: true };
}

/**
 * Basic prompt injection guard for text content extracted from files.
 * Flags content that appears to contain injection attempts.
 * This is a defence-in-depth measure; the primary guard is the system prompt.
 */
export function sanitiseExtractedText(text: string): string {
  // Strip null bytes and non-printable control characters (keep newlines/tabs)
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function validateBase64Size(base64: string): ValidationResult {
  // base64 is ~4/3 the size of binary
  const estimatedBytes = (base64.length * 3) / 4;
  return validateFileSize(estimatedBytes);
}
