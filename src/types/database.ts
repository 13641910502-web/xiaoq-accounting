export interface DbMigration {
  version: number;
  name: string;
  sql: string;
}

export interface OcrCache {
  id: string;
  image_hash: string;
  raw_text: string;
  parsed_data: string | null;
  created_at: string;
}

export const DB_NAME = 'xiaoq_accounting.db';
export const DB_VERSION = 1;
