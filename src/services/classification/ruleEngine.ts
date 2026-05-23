import { getActiveRules, incrementRuleMatchCount } from '../database/rules';
import type { ClassificationRule, ClassificationResult } from '../../types/classification';

let rulesCache: ClassificationRule[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

function getCachedRules(): ClassificationRule[] {
  const now = Date.now();
  if (!rulesCache || now - cacheTimestamp > CACHE_TTL) {
    rulesCache = getActiveRules();
    cacheTimestamp = now;
  }
  return rulesCache;
}

export function clearRulesCache(): void {
  rulesCache = null;
  cacheTimestamp = 0;
}

export function matchRule(text: string): ClassificationResult | null {
  const rules = getCachedRules();

  for (const rule of rules) {
    let matched = false;

    switch (rule.match_type) {
      case 'keyword': {
        // Case-insensitive substring match
        const pattern = rule.pattern.toLowerCase();
        const target = text.toLowerCase();
        matched = target.includes(pattern);
        break;
      }
      case 'regex': {
        try {
          const regex = new RegExp(rule.pattern);
          matched = regex.test(text);
        } catch {
          // Invalid regex, skip
          continue;
        }
        break;
      }
      case 'merchant': {
        // Exact match after normalization
        const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
        const patternNorm = rule.pattern.toLowerCase().replace(/\s+/g, ' ').trim();
        matched = normalized === patternNorm;
        break;
      }
    }

    if (matched) {
      // Increment match count asynchronously, don't block
      try {
        incrementRuleMatchCount(rule.id);
      } catch { /* ignore */ }

      return {
        mainCategory: rule.main_category,
        subCategory: rule.sub_category ?? null,
        confidence: 0.9,
        source: 'rule',
      };
    }
  }

  return null;
}
