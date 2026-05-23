export interface Bill {
  id: string;
  amount: number;
  transaction_date: string;
  transaction_time: string | null;
  description: string;
  main_category: string;
  sub_category: string | null;
  source: 'wechat' | 'alipay' | 'csv' | 'manual' | 'ocr';
  import_batch_id: string | null;
  raw_data: string | null;
  note: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface BillInput {
  amount: number;
  transaction_date: string;
  transaction_time?: string;
  description: string;
  main_category?: string;
  sub_category?: string;
  source: Bill['source'];
  import_batch_id?: string;
  raw_data?: string;
  note?: string;
}

export interface BillFilter {
  categories?: string[];
  dateRange?: { start: string; end: string };
  amountRange?: { min?: number; max?: number };
  searchText?: string;
  source?: Bill['source'];
}
