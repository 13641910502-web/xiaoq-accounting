import * as SQLite from 'expo-sqlite';
import { generateId } from '../../utils/id';
import { DEFAULT_RULES } from '../../constants/rules';
import type { ClassificationRule } from '../../types/classification';

export function seedRules(db: SQLite.SQLiteDatabase): void {
  db.execSync('BEGIN TRANSACTION');
  try {
    for (const rule of DEFAULT_RULES) {
      const id = generateId();
      const now = new Date().toISOString();
      db.runSync(
        'INSERT INTO classification_rules (id, pattern, main_category, sub_category, match_type, priority, is_active, match_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?)',
        [id, rule.pattern, rule.main_category, rule.sub_category ?? null, rule.match_type, rule.priority, now, now]
      );
    }
    db.execSync('COMMIT');
  } catch {
    db.execSync('ROLLBACK');
  }
}

export function getActiveRules(): ClassificationRule[] {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  return db.getAllSync<ClassificationRule>(
    'SELECT * FROM classification_rules WHERE is_active = 1 ORDER BY priority DESC, match_count DESC'
  );
}

export function addRule(pattern: string, mainCategory: string, subCategory: string | null, matchType: 'keyword' | 'regex' | 'merchant' = 'keyword', priority = 0): ClassificationRule {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const id = generateId();
  const now = new Date().toISOString();
  db.runSync(
    'INSERT INTO classification_rules (id, pattern, main_category, sub_category, match_type, priority, is_active, match_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?)',
    [id, pattern, mainCategory, subCategory, matchType, priority, now, now]
  );
  return { id, pattern, main_category: mainCategory, sub_category: subCategory, match_type: matchType, priority, is_active: 1, match_count: 0, created_at: now, updated_at: now };
}

export function incrementRuleMatchCount(id: string): void {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  db.runSync('UPDATE classification_rules SET match_count = match_count + 1, updated_at = ? WHERE id = ?', [new Date().toISOString(), id]);
}

export function updateRulePriority(id: string, priority: number): void {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  db.runSync('UPDATE classification_rules SET priority = ?, updated_at = ? WHERE id = ?', [priority, new Date().toISOString(), id]);
}

export function deleteRule(id: string): void {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  db.runSync('DELETE FROM classification_rules WHERE id = ?', [id]);
}
