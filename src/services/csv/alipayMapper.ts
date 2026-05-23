import type { CsvRow } from './parser';

export function mapAlipayRow(row: Record<string, string>): CsvRow | null {
  const time = row['交易时间'] ?? row['time'] ?? row['日期'] ?? '';
  const description = row['交易对方'] ?? row['商户名称'] ?? row['对方'] ?? row['description'] ?? '';
  const amountStr = row['金额'] ?? row['amount'] ?? '0';
  const status = row['交易状态'] ?? row['status'] ?? '';

  if (status && !status.includes('成功') && !status.includes('success') && !status.includes('交易成功')) {
    return null;
  }

  const amount = parseFloat(amountStr.replace(/[￥¥,]/g, ''));
  if (isNaN(amount) || amount <= 0) return null;

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
