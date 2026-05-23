import * as SQLite from 'expo-sqlite';
import { generateId } from '../../utils/id';
import type { OcrCache } from '../../types/database';

export function getOcrCache(imageHash: string): OcrCache | null {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  return db.getFirstSync<OcrCache>(
    'SELECT * FROM ocr_cache WHERE image_hash = ?',
    [imageHash]
  ) ?? null;
}

export function setOcrCache(imageHash: string, rawText: string): void {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const now = new Date().toISOString();
  const id = generateId();

  db.runSync(
    `INSERT OR REPLACE INTO ocr_cache (id, image_hash, raw_text, parsed_data, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, imageHash, rawText, null, now]
  );
}
