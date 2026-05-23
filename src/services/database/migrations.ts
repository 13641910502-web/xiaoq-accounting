export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    sql: `
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY NOT NULL,
  amount REAL NOT NULL,
  transaction_date TEXT NOT NULL,
  transaction_time TEXT,
  description TEXT NOT NULL,
  main_category TEXT NOT NULL DEFAULT '其他',
  sub_category TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  import_batch_id TEXT,
  raw_data TEXT,
  note TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_bills_category ON bills(main_category, sub_category);
CREATE INDEX IF NOT EXISTS idx_bills_source ON bills(source);
CREATE INDEX IF NOT EXISTS idx_bills_deleted ON bills(is_deleted);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('main', 'sub')),
  parent_id TEXT,
  icon TEXT NOT NULL DEFAULT '📦',
  color TEXT NOT NULL DEFAULT '#B2BEC3',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

CREATE TABLE IF NOT EXISTS classification_rules (
  id TEXT PRIMARY KEY NOT NULL,
  pattern TEXT NOT NULL,
  main_category TEXT NOT NULL,
  sub_category TEXT,
  match_type TEXT NOT NULL DEFAULT 'keyword' CHECK(match_type IN ('keyword', 'regex', 'merchant')),
  priority INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  match_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rules_active ON classification_rules(is_active, priority DESC);

CREATE TABLE IF NOT EXISTS classification_cache (
  id TEXT PRIMARY KEY NOT NULL,
  input_hash TEXT UNIQUE NOT NULL,
  raw_text TEXT NOT NULL,
  main_category TEXT NOT NULL,
  sub_category TEXT,
  confidence REAL NOT NULL DEFAULT 1.0,
  source TEXT NOT NULL CHECK(source IN ('rule', 'claude')),
  hit_count INTEGER NOT NULL DEFAULT 0,
  last_hit_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_hash ON classification_cache(input_hash);

CREATE TABLE IF NOT EXISTS ocr_cache (
  id TEXT PRIMARY KEY NOT NULL,
  image_hash TEXT UNIQUE NOT NULL,
  raw_text TEXT NOT NULL,
  parsed_data TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY NOT NULL,
  main_category TEXT,
  amount REAL NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly' CHECK(period IN ('monthly', 'weekly', 'yearly')),
  alert_threshold REAL NOT NULL DEFAULT 0.8,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS import_logs (
  id TEXT PRIMARY KEY NOT NULL,
  source TEXT NOT NULL,
  file_name TEXT,
  total_rows INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK(status IN ('processing', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  created_at TEXT NOT NULL
);
    `,
  },
];

export function getCurrentVersion(): number {
  return MIGRATIONS.length > 0 ? MIGRATIONS[MIGRATIONS.length - 1].version : 0;
}
