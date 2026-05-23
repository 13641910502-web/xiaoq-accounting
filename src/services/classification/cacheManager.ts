import { getCachedClassification, setCachedClassification } from '../database/cache';
import type { ClassificationResult } from '../../types/classification';

export function checkCache(inputHash: string): ClassificationResult | null {
  const cached = getCachedClassification(inputHash);
  if (!cached) return null;

  return {
    mainCategory: cached.main_category,
    subCategory: cached.sub_category ?? null,
    confidence: cached.confidence,
    source: cached.source as 'rule' | 'claude',
  };
}

export function saveToCache(
  inputHash: string,
  rawText: string,
  result: ClassificationResult
): void {
  setCachedClassification(
    inputHash,
    rawText,
    result.mainCategory,
    result.subCategory,
    result.confidence,
    (result.source === 'cache' ? 'rule' : result.source)
  );
}
