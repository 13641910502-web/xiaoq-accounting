import { callClaude } from '../api/client';
import {
  CLASSIFICATION_SYSTEM_PROMPT,
  buildClassificationPrompt,
} from '../api/prompts';
import { AppConfig } from '../../constants/config';
import type { ClassificationResult } from '../../types/classification';

interface ClaudeResponse {
  mainCategory?: string;
  subCategory?: string | null;
  confidence?: number;
}

const VALID_CATEGORIES = [
  '饮食', '购物', '投资', '人情往来', '交通', '住房', '娱乐', '医疗', '教育', '其他',
];

function parseResponse(text: string): ClassificationResult | null {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed: ClaudeResponse = JSON.parse(jsonMatch[0]);

    if (!parsed.mainCategory || !VALID_CATEGORIES.includes(parsed.mainCategory)) {
      return null;
    }

    return {
      mainCategory: parsed.mainCategory,
      subCategory: parsed.subCategory ?? null,
      confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.7)),
      source: 'claude',
    };
  } catch {
    return null;
  }
}

export async function classifyWithClaude(
  apiKey: string,
  description: string
): Promise<ClassificationResult | null> {
  const prompt = buildClassificationPrompt(description);

  for (let attempt = 0; attempt < AppConfig.maxClassificationRetries; attempt++) {
    try {
      const response = await callClaude(
        apiKey,
        CLASSIFICATION_SYSTEM_PROMPT,
        prompt,
        AppConfig.claudeModel
      );

      const result = parseResponse(response);
      if (result) return result;

      // If parsing failed, retry
    } catch (error: unknown) {
      const err = error as Error;
      if (attempt === AppConfig.maxClassificationRetries - 1) {
        throw new Error(`Claude API error: ${err.message}`);
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return null;
}
