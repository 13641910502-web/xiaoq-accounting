import type { OcrResult } from '../../types/import';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateOcrResult(result: OcrResult): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!result.amount || result.amount <= 0) {
    errors.push({ field: 'amount', message: '金额无效' });
  }
  if (result.amount > 10000000) {
    errors.push({ field: 'amount', message: '金额过大，请确认' });
  }

  if (!result.transaction_date) {
    errors.push({ field: 'transaction_date', message: '日期不能为空' });
  } else {
    const d = new Date(result.transaction_date);
    if (isNaN(d.getTime())) {
      errors.push({ field: 'transaction_date', message: '日期格式无效' });
    }
    if (d > new Date()) {
      errors.push({ field: 'transaction_date', message: '日期不能是未来' });
    }
  }

  if (!result.description || result.description.trim().length === 0) {
    errors.push({ field: 'description', message: '描述不能为空' });
  }

  return errors;
}

export function validateOcrResults(results: OcrResult[]): {
  valid: OcrResult[];
  invalid: { result: OcrResult; errors: ValidationError[] }[];
} {
  const valid: OcrResult[] = [];
  const invalid: { result: OcrResult; errors: ValidationError[] }[] = [];

  for (const result of results) {
    const errors = validateOcrResult(result);
    if (errors.length === 0) {
      valid.push(result);
    } else {
      invalid.push({ result, errors });
    }
  }

  return { valid, invalid };
}
