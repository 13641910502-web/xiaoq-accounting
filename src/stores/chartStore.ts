import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import type { ChartDataPoint, MonthlyData, DashboardSummary } from '../types/chart';
import { CategoryColors } from '../constants/colors';

interface ChartState {
  categoryData: ChartDataPoint[];
  monthlyData: MonthlyData[];
  trendData: { date: string; amount: number }[];
  heatmapData: { date: string; amount: number }[];
  summary: DashboardSummary | null;
  selectedMonth: string;
  isLoading: boolean;

  loadDashboard: (yearMonth: string) => void;
  setSelectedMonth: (month: string) => void;
}

function getCategoryBreakdown(yearMonth: string): ChartDataPoint[] {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const [year, month] = yearMonth.split('-');
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

  const rows = db.getAllSync<{ main_category: string; total: number }>(
    `SELECT main_category, SUM(amount) as total FROM bills
     WHERE transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0
     GROUP BY main_category ORDER BY total DESC`,
    [startDate, endDate]
  );

  return rows.map(row => ({
    label: row.main_category,
    value: row.total,
    color: CategoryColors[row.main_category] ?? '#B2BEC3',
  }));
}

function getMonthlyComparison(months: number): MonthlyData[] {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const result: MonthlyData[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const [year, month] = ym.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    const total = db.getFirstSync<{ t: number }>(
      'SELECT COALESCE(SUM(amount), 0) as t FROM bills WHERE transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0',
      [startDate, endDate]
    )?.t ?? 0;

    const categories = db.getAllSync<{ name: string; amount: number }>(
      `SELECT main_category as name, SUM(amount) as amount FROM bills
       WHERE transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0
       GROUP BY main_category`,
      [startDate, endDate]
    ).map(c => ({ ...c, color: CategoryColors[c.name] ?? '#B2BEC3' }));

    result.push({
      month: ym,
      total,
      categories,
    });
  }

  return result;
}

function getSummary(yearMonth: string): DashboardSummary {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const [year, month] = yearMonth.split('-');
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

  // Current month total
  const spending = db.getFirstSync<{ t: number }>(
    'SELECT COALESCE(SUM(amount), 0) as t FROM bills WHERE transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0',
    [startDate, endDate]
  )?.t ?? 0;

  // Previous month
  const prevMonth = parseInt(month) === 1 ? 12 : parseInt(month) - 1;
  const prevYear = parseInt(month) === 1 ? parseInt(year) - 1 : parseInt(year);
  const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
  const prevEnd = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;

  const prevSpending = db.getFirstSync<{ t: number }>(
    'SELECT COALESCE(SUM(amount), 0) as t FROM bills WHERE transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0',
    [prevStart, prevEnd]
  )?.t ?? 0;

  const monthOverMonth = prevSpending > 0 ? ((spending - prevSpending) / prevSpending) * 100 : 0;

  // Top category
  const top = db.getFirstSync<{ c: string; a: number }>(
    `SELECT main_category as c, SUM(amount) as a FROM bills
     WHERE transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0
     GROUP BY main_category ORDER BY a DESC LIMIT 1`,
    [startDate, endDate]
  );

  // Bill count
  const count = db.getFirstSync<{ c: number }>(
    'SELECT COUNT(*) as c FROM bills WHERE transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0',
    [startDate, endDate]
  )?.c ?? 0;

  const catColors = CategoryColors;
  return {
    totalSpending: spending,
    monthOverMonth: Math.round(monthOverMonth * 10) / 10,
    topCategory: {
      name: top?.c ?? '暂无',
      amount: top?.a ?? 0,
      icon: '📦',
      color: top?.c ? (catColors[top.c] ?? '#B2BEC3') : '#B2BEC3',
    },
    billCount: count,
  };
}

function getTrendData(yearMonth: string): { date: string; amount: number }[] {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const [year, month] = yearMonth.split('-');
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

  return db.getAllSync<{ date: string; amount: number }>(
    `SELECT transaction_date as date, SUM(amount) as amount FROM bills
     WHERE transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0
     GROUP BY transaction_date ORDER BY transaction_date ASC`,
    [startDate, endDate]
  );
}

function getHeatmapData(): { date: string; amount: number }[] {
  const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 84); // 12 weeks ago
  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = now.toISOString().slice(0, 10);

  return db.getAllSync<{ date: string; amount: number }>(
    `SELECT transaction_date as date, SUM(amount) as amount FROM bills
     WHERE transaction_date >= ? AND transaction_date <= ? AND is_deleted = 0
     GROUP BY transaction_date ORDER BY transaction_date ASC`,
    [startStr, endStr]
  );
}

export const useChartStore = create<ChartState>((set) => ({
  categoryData: [],
  monthlyData: [],
  trendData: [],
  heatmapData: [],
  summary: null,
  selectedMonth: new Date().toISOString().slice(0, 7),
  isLoading: false,

  loadDashboard: (yearMonth) => {
    set({ isLoading: true });
    try {
      const categoryData = getCategoryBreakdown(yearMonth);
      const monthlyData = getMonthlyComparison(6);
      const trendData = getTrendData(yearMonth);
      const heatmapData = getHeatmapData();
      const summary = getSummary(yearMonth);
      set({ categoryData, monthlyData, trendData, heatmapData, summary, isLoading: false, selectedMonth: yearMonth });
    } catch {
      set({ isLoading: false });
    }
  },

  setSelectedMonth: (month) => set({ selectedMonth: month }),
}));
