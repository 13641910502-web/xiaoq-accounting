import type { CsvRow } from './parser';

export function mapWeChatRow(row: Record<string, string>): CsvRow | null {
  const time = row['交易时间'] ?? row['time'] ?? row['日期'] ?? '';
  const description = row['商品说明'] ?? row['商品'] ?? row['description'] ?? row['交易对方'] ?? '';
  const amountStr = row['金额(元)'] ?? row['金额'] ?? row['amount'] ?? '0';
  const type = row['收/支'] ?? row['收支类型'] ?? '';

  const amount = parseFloat(amountStr.replace(/[￥¥,]/g, ''));
  if (isNaN(amount) || amount <= 0) return null;

  if (type === '收入') return null;

  const dateMatch = time.match(/(\d{4})-?(\d{1,2})-?(\d{1,2})/);
  const date = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`
    : '';

  return {
    date,
    description: description.replace(/["""]/g, ''),
    amount: Math.abs(amount),
  };
}
