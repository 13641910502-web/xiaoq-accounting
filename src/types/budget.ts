export interface Budget {
  id: string;
  main_category: string | null;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  alert_threshold: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  percentage: number;
  isOverBudget: boolean;
  isWarning: boolean;
}
