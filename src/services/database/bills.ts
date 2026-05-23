import { getDatabase } from './index';
import { generateId } from '../../utils/id';
import type { Bill, BillInput, BillFilter } from '../../types/bill';
import type { SQLiteBindValue } from 'expo-sqlite';

export function insertBill(input: BillInput): Bill {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = generateId();
  const bill: Bill = {
    id,
    amount: input.amount,
    transaction_date: input.transaction_date,
    transaction_time: input.transaction_time ?? null,
    description: input.description,
    main_category: input.main_category ?? '其他',
    sub_category: input.sub_category ?? null,
    source: input.source,
    import_batch_id: input.import_batch_id ?? null,
    raw_data: input.raw_data ?? null,
    note: input.note ?? null,
    is_deleted: 0,
    created_at: now,
    updated_at: now,
  };

  db.runSync(
    `INSERT INTO bills (id, amount, transaction_date, transaction_time, description, main_category, sub_category, source, import_batch_id, raw_data, note, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bill.id, bill.amount, bill.transaction_date, bill.transaction_time, bill.description, bill.main_category, bill.sub_category, bill.source, bill.import_batch_id, bill.raw_data, bill.note, bill.is_deleted, bill.created_at, bill.updated_at]
  );
  return bill;
}

export function updateBill(id: string, updates: Partial<BillInput>): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
  if (updates.transaction_date !== undefined) { fields.push('transaction_date = ?'); values.push(updates.transaction_date); }
  if (updates.transaction_time !== undefined) { fields.push('transaction_time = ?'); values.push(updates.transaction_time); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.main_category !== undefined) { fields.push('main_category = ?'); values.push(updates.main_category); }
  if (updates.sub_category !== undefined) { fields.push('sub_category = ?'); values.push(updates.sub_category); }
  if (updates.note !== undefined) { fields.push('note = ?'); values.push(updates.note); }

  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    db.runSync(`UPDATE bills SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export function softDeleteBill(id: string): void {
  const db = getDatabase();
  db.runSync('UPDATE bills SET is_deleted = 1, updated_at = ? WHERE id = ?', [new Date().toISOString(), id]);
}

export function getBillById(id: string): Bill | null {
  const db = getDatabase();
  return db.getFirstSync<Bill>('SELECT * FROM bills WHERE id = ? AND is_deleted = 0', [id]) ?? null;
}

export function getBills(filter?: BillFilter, limit = 50, offset = 0): Bill[] {
  const db = getDatabase();
  const conditions: string[] = ['is_deleted = 0'];
  const params: SQLiteBindValue[] = [];

  if (filter?.categories && filter.categories.length > 0) {
    conditions.push(`main_category IN (${filter.categories.map(() => '?').join(',')})`);
    params.push(...filter.categories);
  }
  if (filter?.dateRange) {
    conditions.push('transaction_date >= ? AND transaction_date <= ?');
    params.push(filter.dateRange.start, filter.dateRange.end);
  }
  if (filter?.amountRange?.min !== undefined) {
    conditions.push('amount >= ?');
    params.push(filter.amountRange.min);
  }
  if (filter?.amountRange?.max !== undefined) {
    conditions.push('amount <= ?');
    params.push(filter.amountRange.max);
  }
  if (filter?.searchText) {
    conditions.push('description LIKE ?');
    params.push(`%${filter.searchText}%`);
  }
  if (filter?.source) {
    conditions.push('source = ?');
    params.push(filter.source);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);
  return db.getAllSync<Bill>(
    `SELECT * FROM bills ${where} ORDER BY transaction_date DESC, created_at DESC LIMIT ? OFFSET ?`,
    ...params
  );
}

export function getBillCount(filter?: BillFilter): number {
  const db = getDatabase();
  const conditions: string[] = ['is_deleted = 0'];
  const params: SQLiteBindValue[] = [];

  if (filter?.categories && filter.categories.length > 0) {
    conditions.push(`main_category IN (${filter.categories.map(() => '?').join(',')})`);
    params.push(...filter.categories);
  }
  if (filter?.dateRange) {
    conditions.push('transaction_date >= ? AND transaction_date <= ?');
    params.push(filter.dateRange.start, filter.dateRange.end);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = db.getFirstSync<{ count: number }>(`SELECT COUNT(*) as count FROM bills ${where}`, ...params);
  return result?.count ?? 0;
}

export function batchInsertBills(inputs: BillInput[]): Bill[] {
  const db = getDatabase();
  const bills: Bill[] = [];
  db.execSync('BEGIN TRANSACTION');
  try {
    for (const input of inputs) {
      bills.push(insertBill(input));
    }
    db.execSync('COMMIT');
  } catch (error) {
    db.execSync('ROLLBACK');
    throw error;
  }
  return bills;
}

export function getCategorySpending(mainCategory: string | null, yearMonth: string): number {
  const db = getDatabase();
  const [year, month] = yearMonth.split('-');
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

  const result = db.getFirstSync<{ total: number }>(
    mainCategory
      ? 'SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE main_category = ? AND transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0'
      : 'SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0',
    mainCategory ? [mainCategory, startDate, endDate] : [startDate, endDate]
  );
  return result?.total ?? 0;
}
