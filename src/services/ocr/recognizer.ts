import * as FileSystem from 'expo-file-system/legacy';
import { callClaudeVision } from '../api/client';
import { OCR_SYSTEM_PROMPT, buildOcrPrompt } from '../api/prompts';
import { AppConfig } from '../../constants/config';
import { simpleHash } from '../../utils/hash';
import { getOcrCache, setOcrCache } from './cache';

export interface OcrTextResult {
  rawText: string;
  imageHash: string;
}

export async function recognizeImage(apiKey: string, imageUri: string): Promise<OcrTextResult> {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });

  const imageHash = simpleHash(base64.slice(0, 1000));

  const cached = getOcrCache(imageHash);
  if (cached) {
    return { rawText: cached.raw_text, imageHash };
  }

  const mediaType = imageUri.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const response = await callClaudeVision(
    apiKey,
    OCR_SYSTEM_PROMPT,
    buildOcrPrompt(),
    base64,
    mediaType,
    AppConfig.claudeModel,
    1024
  );

  setOcrCache(imageHash, response);

  return { rawText: response, imageHash };
}
