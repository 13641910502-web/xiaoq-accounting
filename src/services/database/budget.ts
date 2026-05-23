import * as SQLite from 'expo-sqlite';
import { generateId } from '../../utils/id';
import type { Budget } from '../../types/budget';

export function getBudgets(): Budget[] {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  return db.getAllSync<Budget>('SELECT * FROM budgets WHERE is_active = 1');
}

export function getBudgetByCategory(mainCategory: string | null): Budget | null {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  return db.getFirstSync<Budget>(
    'SELECT * FROM budgets WHERE main_category IS ? AND is_active = 1',
    [mainCategory]
  ) ?? null;
}

export function setBudget(mainCategory: string | null, amount: number, period: string = 'monthly', alertThreshold = 0.8): Budget {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const existing = getBudgetByCategory(mainCategory);

  if (existing) {
    db.runSync(
      'UPDATE budgets SET amount = ?, period = ?, alert_threshold = ?, updated_at = ? WHERE id = ?',
      [amount, period, alertThreshold, new Date().toISOString(), existing.id]
    );
    return { ...existing, amount, period: period as Budget['period'], alert_threshold: alertThreshold, updated_at: new Date().toISOString() };
  }

  const id = generateId();
  const now = new Date().toISOString();
  db.runSync(
    'INSERT INTO budgets (id, main_category, amount, period, alert_threshold, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)',
    [id, mainCategory, amount, period, alertThreshold, now, now]
  );
  return { id, main_category: mainCategory, amount, period: period as Budget['period'], alert_threshold: alertThreshold, is_active: 1, created_at: now, updated_at: now };
}

export function deleteBudget(id: string): void {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  db.runSync('UPDATE budgets SET is_active = 0, updated_at = ? WHERE id = ?', [new Date().toISOString(), id]);
}
