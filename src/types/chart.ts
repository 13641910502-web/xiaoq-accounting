export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MonthlyData {
  month: string;
  total: number;
  categories: { name: string; amount: number; color: string }[];
}

export interface DailyHeatmapData {
  dayOfWeek: number;
  weekIndex: number;
  date: string;
  amount: number;
}

export interface DashboardSummary {
  totalSpending: number;
  monthOverMonth: number;
  topCategory: { name: string; amount: number; icon: string; color: string };
  billCount: number;
}
