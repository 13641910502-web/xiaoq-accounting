import * as SQLite from 'expo-sqlite';
import { generateId } from '../../utils/id';
import type { ClassificationCache } from '../../types/classification';

export function getCachedClassification(inputHash: string): ClassificationCache | null {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const result = db.getFirstSync<ClassificationCache>(
    'SELECT * FROM classification_cache WHERE input_hash = ?',
    [inputHash]
  );
  if (result) {
    db.runSync(
      'UPDATE classification_cache SET hit_count = hit_count + 1, last_hit_at = ? WHERE id = ?',
      [new Date().toISOString(), result.id]
    );
  }
  return result ?? null;
}

export function setCachedClassification(
  inputHash: string,
  rawText: string,
  mainCategory: string,
  subCategory: string | null,
  confidence: number,
  source: 'rule' | 'claude'
): void {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const now = new Date().toISOString();
  const id = generateId();

  db.runSync(
    `INSERT OR REPLACE INTO classification_cache (id, input_hash, raw_text, main_category, sub_category, confidence, source, hit_count, last_hit_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [id, inputHash, rawText, mainCategory, subCategory, confidence, source, now, now]
  );
}
