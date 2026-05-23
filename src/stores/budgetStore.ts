import { create } from 'zustand';
import type { Budget, BudgetStatus } from '../types/budget';
import * as budgetDb from '../services/database/budget';
import { getCategorySpending } from '../services/database/bills';
import { getCurrentYearMonth } from '../utils/date';

interface BudgetState {
  budgets: Budget[];
  statuses: BudgetStatus[];
  isLoading: boolean;

  loadBudgets: () => void;
  setBudget: (mainCategory: string | null, amount: number, period?: string, alertThreshold?: number) => void;
  removeBudget: (id: string) => void;
  getStatuses: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  statuses: [],
  isLoading: false,

  loadBudgets: () => {
    set({ isLoading: true });
    try {
      const budgets = budgetDb.getBudgets();
      set({ budgets, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setBudget: (mainCategory, amount, period = 'monthly', alertThreshold = 0.8) => {
    budgetDb.setBudget(mainCategory, amount, period, alertThreshold);
    get().loadBudgets();
  },

  removeBudget: (id) => {
    budgetDb.deleteBudget(id);
    get().loadBudgets();
  },

  getStatuses: () => {
    const { budgets } = get();
    const yearMonth = getCurrentYearMonth();
    const statuses: BudgetStatus[] = budgets.map(budget => {
      const spent = getCategorySpending(budget.main_category, yearMonth);
      const percentage = budget.amount > 0 ? spent / budget.amount : 0;
      return {
        budget,
        spent,
        percentage,
        isOverBudget: percentage >= 1,
        isWarning: percentage >= budget.alert_threshold && percentage < 1,
      };
    });
    set({ statuses });
  },
}));
