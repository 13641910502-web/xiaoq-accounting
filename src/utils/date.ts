export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return '今天';
  if (date.toDateString() === yesterday.toDateString()) return '昨天';

  const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
  const dayName = `周${dayOfWeek[date.getDay()]}`;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  if (year === today.getFullYear()) {
    return `${month}月${day}日 ${dayName}`;
  }
  return `${year}年${month}月${day}日`;
}

export function formatMonth(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${year}年${parseInt(month)}月`;
}

export function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(dateStr).toDateString() === yesterday.toDateString();
}
