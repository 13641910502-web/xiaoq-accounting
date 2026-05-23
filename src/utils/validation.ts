export function isValidAmount(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0 && num < 100000000;
}

export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

export function isValidDescription(desc: string): boolean {
  return desc.trim().length > 0 && desc.trim().length <= 200;
}
