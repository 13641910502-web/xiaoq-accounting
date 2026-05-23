import { preprocess } from './preprocessor';
import { checkCache, saveToCache } from './cacheManager';
import { matchRule, clearRulesCache } from './ruleEngine';
import { classifyWithClaude } from './claudeClassifier';
import { addRule } from '../database/rules';
import { logger } from '../../utils/logger';
import type { ClassificationResult } from '../../types/classification';

export interface ClassifyOptions {
  apiKey?: string;
  useAI?: boolean;
  onClassified?: (result: ClassificationResult) => void;
}

export async function classifyTransaction(
  description: string,
  options: ClassifyOptions = {}
): Promise<ClassificationResult> {
  const { apiKey, useAI = true, onClassified } = options;
  const { normalized, hash } = preprocess(description);

  // Step 1: Check cache
  const cached = checkCache(hash);
  if (cached) {
    logger.log('Classify', `Cache hit: "${description}" → ${cached.mainCategory}`);
    onClassified?.(cached);
    return cached;
  }

  // Step 2: Rule engine
  const ruleMatch = matchRule(normalized);
  if (ruleMatch) {
    logger.log('Classify', `Rule match: "${description}" → ${ruleMatch.mainCategory}`);
    saveToCache(hash, normalized, ruleMatch);
    onClassified?.(ruleMatch);
    return ruleMatch;
  }

  // Step 3: Claude API (if available)
  if (useAI && apiKey) {
    try {
      const claudeResult = await classifyWithClaude(apiKey, normalized);
      if (claudeResult) {
        logger.log('Classify', `Claude: "${description}" → ${claudeResult.mainCategory}`);
        saveToCache(hash, normalized, claudeResult);
        onClassified?.(claudeResult);
        return claudeResult;
      }
    } catch (error) {
      logger.warn('Classify', 'Claude API failed, falling back to default', error);
    }
  }

  // Step 4: Default fallback
  const fallback: ClassificationResult = {
    mainCategory: '其他',
    subCategory: null,
    confidence: 0.1,
    source: 'rule',
  };
  saveToCache(hash, normalized, fallback);
  onClassified?.(fallback);
  return fallback;
}

export async function classifyBatch(
  descriptions: string[],
  options: ClassifyOptions = {}
): Promise<ClassificationResult[]> {
  const results: ClassificationResult[] = [];
  let apiCalls = 0;
  const { apiKey, useAI = true } = options;

  for (const desc of descriptions) {
    // For batch, only check cache and rules first; defer AI calls
    const { normalized, hash } = preprocess(desc);

    const cached = checkCache(hash);
    if (cached) {
      results.push(cached);
      continue;
    }

    const ruleMatch = matchRule(normalized);
    if (ruleMatch) {
      saveToCache(hash, normalized, ruleMatch);
      results.push(ruleMatch);
      continue;
    }

    results.push({
      mainCategory: '其他',
      subCategory: null,
      confidence: 0.1,
      source: 'rule',
    });
  }

  return results;
}

export function onUserReclassify(
  description: string,
  newMainCategory: string,
  newSubCategory: string | null
): void {
  // Clear rules cache to pick up new rule
  clearRulesCache();

  // Create a new keyword rule from the exact description
  try {
    addRule(description, newMainCategory, newSubCategory, 'keyword', 10);
    logger.log('Classify', `New rule created from user feedback: "${description}" → ${newMainCategory}`);
  } catch (error) {
    logger.warn('Classify', 'Failed to create rule from user feedback', error);
  }
}
