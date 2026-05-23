import * as SQLite from 'expo-sqlite';
import { generateId } from '../../utils/id';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import type { Category } from '../../types/category';
import type { SQLiteBindValue } from 'expo-sqlite';

export function seedCategories(db: SQLite.SQLiteDatabase): void {
  db.execSync('BEGIN TRANSACTION');
  try {
    for (const cat of DEFAULT_CATEGORIES) {
      db.runSync(
        'INSERT INTO categories (id, name, type, parent_id, icon, color, sort_order, is_system, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)',
        [cat.id, cat.name, cat.type, cat.parentId ?? null, cat.icon, cat.color, cat.sortOrder ?? 0]
      );
    }
    db.execSync('COMMIT');
  } catch {
    db.execSync('ROLLBACK');
  }
}

export function getMainCategories(): Category[] {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  return db.getAllSync<Category>(
    'SELECT * FROM categories WHERE type = ? AND is_active = 1 ORDER BY sort_order',
    ['main']
  );
}

export function getSubCategories(parentId: string): Category[] {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  return db.getAllSync<Category>(
    'SELECT * FROM categories WHERE type = ? AND parent_id = ? AND is_active = 1 ORDER BY sort_order',
    ['sub', parentId]
  );
}

export function getAllCategories(): Category[] {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  return db.getAllSync<Category>(
    'SELECT * FROM categories WHERE is_active = 1 ORDER BY type, sort_order'
  );
}

export function addCategory(name: string, type: 'main' | 'sub', parentId: string | null, icon: string, color: string): Category {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const id = generateId();
  const maxOrder = db.getFirstSync<{ m: number }>('SELECT MAX(sort_order) as m FROM categories WHERE type = ?', [type]);
  const sortOrder = (maxOrder?.m ?? 0) + 1;

  db.runSync(
    'INSERT INTO categories (id, name, type, parent_id, icon, color, sort_order, is_system, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1)',
    [id, name, type, parentId, icon, color, sortOrder]
  );
  return { id, name, type, parent_id: parentId, icon, color, sort_order: sortOrder, is_system: 0, is_active: 1 };
}

export function updateCategory(id: string, updates: { name?: string; icon?: string; color?: string; is_active?: number }): void {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (updates.name) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.icon) { fields.push('icon = ?'); values.push(updates.icon); }
  if (updates.color) { fields.push('color = ?'); values.push(updates.color); }
  if (updates.is_active !== undefined) { fields.push('is_active = ?'); values.push(updates.is_active); }

  if (fields.length > 0) {
    values.push(id);
    db.runSync(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export function deleteCategory(id: string): void {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  db.runSync('UPDATE categories SET is_active = 0 WHERE id = ? AND is_system = 0', [id]);
}
