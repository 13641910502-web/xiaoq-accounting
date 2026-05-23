import * as SQLite from 'expo-sqlite';
import { generateId } from '../../utils/id';
import type { ImportLog } from '../../types/import';
import type { SQLiteBindValue } from 'expo-sqlite';

export function createImportLog(source: ImportLog['source'], fileName?: string): ImportLog {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const id = generateId();
  const now = new Date().toISOString();
  db.runSync(
    'INSERT INTO import_logs (id, source, file_name, total_rows, success_count, status, created_at) VALUES (?, ?, ?, 0, 0, ?, ?)',
    [id, source, fileName ?? null, 'processing', now]
  );
  return { id, source, file_name: fileName ?? null, total_rows: 0, success_count: 0, status: 'processing', error_message: null, created_at: now };
}

export function updateImportLog(id: string, updates: { total_rows?: number; success_count?: number; status?: ImportLog['status']; error_message?: string }): void {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (updates.total_rows !== undefined) { fields.push('total_rows = ?'); values.push(updates.total_rows); }
  if (updates.success_count !== undefined) { fields.push('success_count = ?'); values.push(updates.success_count); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.error_message !== undefined) { fields.push('error_message = ?'); values.push(updates.error_message); }

  if (fields.length > 0) {
    values.push(id);
    db.runSync(`UPDATE import_logs SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}
