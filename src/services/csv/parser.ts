import * as Papa from 'papaparse';

export interface CsvRow {
  date: string;
  description: string;
  amount: number;
  category?: string;
}

export interface CsvParseResult {
  rows: CsvRow[];
  source: 'wechat' | 'alipay' | 'unknown';
  headers: string[];
  encoding: string;
  totalCount: number;
  validCount: number;
}

function detectSource(headers: string[]): 'wechat' | 'alipay' | 'unknown' {
  const h = headers.map((hdr: string) => hdr.toLowerCase().trim());

  if (h.some((c: string) => c.includes('微信') || c.includes('wechat'))) return 'wechat';
  if (h.includes('交易对方') && h.includes('商品说明')) return 'wechat';
  if (h.includes('交易时间') && h.includes('交易对方') && h.includes('金额')) return 'wechat';

  if (h.some((c: string) => c.includes('支付宝') || c.includes('alipay'))) return 'alipay';
  if (h.includes('交易时间') && h.includes('交易对方') && h.includes('金额') && h.includes('交易状态')) return 'alipay';
  if (h.includes('交易时间') && h.includes('商户名称')) return 'alipay';

  return 'unknown';
}

function parseDate(value: string): string {
  const cleaned = value.trim().replace(/["""]/g, '');
  const match = cleaned.match(/(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  }
  const iso = new Date(cleaned);
  if (!isNaN(iso.getTime())) {
    return iso.toISOString().slice(0, 10);
  }
  return '';
}

function parseAmount(value: string): number {
  const cleaned = value.trim()
    .replace(/["""]/g, '')
    .replace(/[￥¥,]/g, '')
    .replace(/\+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

function findField(headers: string[], candidates: string[]): number {
  const lower = headers.map((hdr: string) => hdr.toLowerCase().trim());
  for (const c of candidates) {
    const idx = lower.indexOf(c.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseCsvFile(content: string): CsvParseResult {
  const result = Papa.parse<string[]>(content, {
    skipEmptyLines: true,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`CSV解析失败: ${result.errors[0].message}`);
  }

  const allRows = result.data.filter((row: string[]) => row.some((cell: string) => cell.trim() !== ''));
  if (allRows.length === 0) {
    throw new Error('CSV文件为空');
  }

  const headers = allRows[0].map((hdr: string) => hdr.trim());
  const source = detectSource(headers);
  const dataRows = allRows.slice(1);

  const dateIdx = findField(headers, ['交易时间', '日期', 'date', 'time', '时间']);
  const descIdx = findField(headers, ['商品说明', '交易对方', '商户名称', '商品', 'description', 'desc', '说明', '对方', '商户']);
  const amountIdx = findField(headers, ['金额', 'amount', '支出', '金额(元)']);

  const rows: CsvRow[] = [];
  for (const row of dataRows) {
    const date = dateIdx >= 0 ? parseDate(row[dateIdx] ?? '') : '';
    const description = descIdx >= 0 ? (row[descIdx] ?? '').trim().replace(/["""]/g, '') : '';
    const amount = amountIdx >= 0 ? parseAmount(row[amountIdx] ?? '0') : 0;

    if (date && amount > 0) {
      rows.push({ date, description, amount });
    }
  }

  return {
    rows,
    source,
    headers,
    encoding: 'UTF-8',
    totalCount: dataRows.length,
    validCount: rows.length,
  };
}
