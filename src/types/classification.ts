export interface ClassificationRule {
  id: string;
  pattern: string;
  main_category: string;
  sub_category: string | null;
  match_type: 'keyword' | 'regex' | 'merchant';
  priority: number;
  is_active: number;
  match_count: number;
  created_at: string;
  updated_at: string;
}

export interface ClassificationCache {
  id: string;
  input_hash: string;
  raw_text: string;
  main_category: string;
  sub_category: string | null;
  confidence: number;
  source: 'rule' | 'claude';
  hit_count: number;
  last_hit_at: string | null;
  created_at: string;
}

export interface ClassificationResult {
  mainCategory: string;
  subCategory: string | null;
  confidence: number;
  source: 'cache' | 'rule' | 'claude';
}
