import { simpleHash } from '../../utils/hash';

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // Strip emojis/surrogate pairs
    .replace(/[^一-鿿㐀-䶿a-zA-Z0-9\s]/g, '') // Keep Chinese + alphanumeric + spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function hashText(text: string): string {
  const normalized = normalizeText(text);
  return simpleHash(normalized);
}

export interface PreprocessedInput {
  original: string;
  normalized: string;
  hash: string;
}

export function preprocess(text: string): PreprocessedInput {
  const normalized = normalizeText(text);
  return {
    original: text.trim(),
    normalized,
    hash: simpleHash(normalized),
  };
}
