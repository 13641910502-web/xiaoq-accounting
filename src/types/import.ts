export interface ImportLog {
  id: string;
  source: 'screenshot' | 'csv_wechat' | 'csv_alipay' | 'manual';
  file_name: string | null;
  total_rows: number;
  success_count: number;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  error_message: string | null;
  created_at: string;
}

export interface OcrResult {
  amount: number;
  transaction_date: string;
  transaction_time?: string;
  description: string;
  merchant?: string;
  confidence: number;
}

export type ImportStep =
  | 'idle'
  | 'capturing'
  | 'recognizing'
  | 'reviewing'
  | 'saving'
  | 'done';

export interface ImportState {
  step: ImportStep;
  source: 'screenshot' | 'csv' | 'manual' | null;
  results: OcrResult[];
  imageUri: string | null;
  csvFile: string | null;
  batchId: string | null;
  error: string | null;
}
