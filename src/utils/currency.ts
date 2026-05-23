export function formatAmount(amount: number, showSign = true): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!showSign) return `¥${formatted}`;
  const sign = amount < 0 ? '-' : '';
  return `${sign}¥${formatted}`;
}

export function formatAmountShort(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 10000) {
    return `¥${(abs / 10000).toFixed(1)}万`;
  }
  if (abs >= 1000) {
    return `¥${(abs / 1000).toFixed(1)}k`;
  }
  return `¥${abs.toFixed(0)}`;
}
