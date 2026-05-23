import * as SQLite from 'expo-sqlite';
import { MIGRATIONS, getCurrentVersion } from './migrations';
import { seedCategories } from './categories';
import { seedRules } from './rules';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDatabase();

  database.execSync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const result = database.getFirstSync<{ version: number }>(
    'SELECT MAX(version) as version FROM _migrations'
  );
  const currentVersion = result?.version ?? 0;
  const targetVersion = getCurrentVersion();

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      database.execSync(migration.sql);
      database.runSync(
        'INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)',
        [migration.version, migration.name, new Date().toISOString()]
      );
    }
  }

  if (currentVersion === 0) {
    seedCategories(database);
    seedRules(database);
  }
}

export function closeDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
  }
}
