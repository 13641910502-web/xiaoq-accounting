import type { OcrResult } from '../../types/import';
import { AppConfig } from '../../constants/config';

function extractAmount(text: string): { amount: number; confidence: number } | null {
  const patterns = [
    /合计[：:]\s*[￥¥]?\s*([\d,]+\.?\d*)/,
    /总计[：:]\s*[￥¥]?\s*([\d,]+\.?\d*)/,
    /实付[：:]\s*[￥¥]?\s*([\d,]+\.?\d*)/,
    /支付[：:]\s*[￥¥]?\s*([\d,]+\.?\d*)/,
    /消费[：:]\s*[￥¥]?\s*([\d,]+\.?\d*)/,
    /金额[：:]\s*[￥¥]?\s*([\d,]+\.?\d*)/,
    /[￥¥]\s*([\d,]+\.?\d*)/,
    /(\d+\.?\d*)\s*元/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        return { amount, confidence: 0.85 };
      }
    }
  }

  // fallback: find largest number
  const numbers = text.match(/\d+\.?\d*/g);
  if (numbers) {
    const candidates = numbers.map(parseFloat).filter(n => n > 0 && n < 1000000);
    if (candidates.length > 0) {
      return { amount: Math.max(...candidates), confidence: 0.3 };
    }
  }

  return null;
}

function extractDate(text: string): { date: string; confidence: number } | null {
  const patterns = [
    /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/,
    /(\d{2})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/,
    /(\d{1,2})[月\-\/](\d{1,2})日?/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let year = match[1];
      let month = match[2];
      let day = match[3];

      if (year.length === 2) year = `20${year}`;
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      const isValid = !isNaN(new Date(date).getTime());
      if (isValid) {
        return { date, confidence: 0.8 };
      }
    }
  }

  return null;
}

function extractMerchant(text: string): string | null {
  const patterns = [
    /商户[：:]\s*([^\n]+)/,
    /商家[：:]\s*([^\n]+)/,
    /收款方[：:]\s*([^\n]+)/,
    /对方[：:]\s*([^\n]+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length > 0 && lines[0].length < 30) {
    return lines[0].trim();
  }

  return null;
}

function extractTime(text: string): string | null {
  const match = text.match(/(\d{1,2}):(\d{2})(:(\d{2}))?/);
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}:${match[4] ?? '00'}`;
  }
  return null;
}

export function parseOcrText(rawText: string): OcrResult[] {
  const results: OcrResult[] = [];
  let overallConfidence = 1.0;

  const amountResult = extractAmount(rawText);
  const dateResult = extractDate(rawText);
  const merchant = extractMerchant(rawText);
  const time = extractTime(rawText);

  if (!amountResult) return [];

  overallConfidence = (amountResult.confidence + (dateResult?.confidence ?? 0.5)) / 2;

  const description = merchant
    ? `${merchant}消费`
    : '未知消费';

  results.push({
    amount: amountResult.amount,
    transaction_date: dateResult?.date ?? new Date().toISOString().slice(0, 10),
    transaction_time: time ?? undefined,
    description,
    merchant: merchant ?? undefined,
    confidence: overallConfidence,
  });

  return results;
}
