import { create } from 'zustand';
import type { Bill, BillInput, BillFilter } from '../types/bill';
import * as billDb from '../services/database/bills';
import { classifyTransaction, onUserReclassify } from '../services/classification/engine';

interface BillState {
  bills: Bill[];
  selectedBill: Bill | null;
  filter: BillFilter;
  isLoading: boolean;
  hasMore: boolean;
  offset: number;

  fetchBills: (reset?: boolean) => void;
  fetchBillById: (id: string) => void;
  addBill: (input: BillInput) => Bill;
  addBillAsync: (input: BillInput) => Promise<Bill>;
  editBill: (id: string, updates: Partial<BillInput>, originalCategory?: string) => void;
  removeBill: (id: string) => void;
  batchAddBills: (inputs: BillInput[]) => Bill[];
  setFilter: (filter: Partial<BillFilter>) => void;
  clearFilter: () => void;
  refresh: () => void;
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: [],
  selectedBill: null,
  filter: {},
  isLoading: false,
  hasMore: true,
  offset: 0,

  fetchBills: (reset = false) => {
    const { filter, offset, isLoading } = get();
    if (isLoading) return;

    const newOffset = reset ? 0 : offset;
    set({ isLoading: true });

    try {
      const bills = billDb.getBills(filter, 50, newOffset);
      const count = billDb.getBillCount(filter);
      set(state => ({
        bills: reset ? bills : [...state.bills, ...bills],
        offset: newOffset + bills.length,
        hasMore: (reset ? bills.length : state.bills.length + bills.length) < count,
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  fetchBillById: (id: string) => {
    const bill = billDb.getBillById(id);
    set({ selectedBill: bill });
  },

  addBill: (input: BillInput) => {
    const bill = billDb.insertBill(input);
    set(state => ({ bills: [bill, ...state.bills] }));

    // Kick off async classification in background if no category set
    if (!input.main_category || input.main_category === '其他') {
      classifyTransaction(input.description, {
        onClassified: (result) => {
          billDb.updateBill(bill.id, {
            main_category: result.mainCategory,
            sub_category: result.subCategory ?? undefined,
          });
          set(state => ({
            bills: state.bills.map(b =>
              b.id === bill.id
                ? { ...b, main_category: result.mainCategory, sub_category: result.subCategory, updated_at: new Date().toISOString() }
                : b
            ),
          }));
        },
      });
    }

    return bill;
  },

  addBillAsync: async (input: BillInput) => {
    const bill = billDb.insertBill(input);
    set(state => ({ bills: [bill, ...state.bills] }));

    if (!input.main_category || input.main_category === '其他') {
      try {
        const result = await classifyTransaction(input.description);
        billDb.updateBill(bill.id, {
          main_category: result.mainCategory,
          sub_category: result.subCategory ?? undefined,
        });
        set(state => ({
          bills: state.bills.map(b =>
            b.id === bill.id
              ? { ...b, main_category: result.mainCategory, sub_category: result.subCategory, updated_at: new Date().toISOString() }
              : b
          ),
        }));
      } catch { /* classification is best-effort */ }
    }

    return bill;
  },

  editBill: (id: string, updates: Partial<BillInput>, originalCategory?: string) => {
    const oldBill = get().bills.find(b => b.id === id);
    billDb.updateBill(id, updates);

    set(state => ({
      bills: state.bills.map(b => b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } as Bill : b),
      selectedBill: state.selectedBill?.id === id ? { ...state.selectedBill, ...updates, updated_at: new Date().toISOString() } as Bill : state.selectedBill,
    }));

    // User feedback: if category was changed, create/update classification rule
    if (updates.main_category && oldBill) {
      const oldCat = originalCategory ?? oldBill.main_category;
      if (updates.main_category !== oldCat) {
        try {
          onUserReclassify(oldBill.description, updates.main_category, updates.sub_category ?? null);
        } catch { /* best effort */ }
      }
    }
  },

  removeBill: (id: string) => {
    billDb.softDeleteBill(id);
    set(state => ({
      bills: state.bills.filter(b => b.id !== id),
      selectedBill: state.selectedBill?.id === id ? null : state.selectedBill,
    }));
  },

  batchAddBills: (inputs: BillInput[]) => {
    const newBills = billDb.batchInsertBills(inputs);
    set(state => ({ bills: [...newBills, ...state.bills] }));
    return newBills;
  },

  setFilter: (newFilter: Partial<BillFilter>) => {
    set(state => ({ filter: { ...state.filter, ...newFilter } }));
    get().fetchBills(true);
  },

  clearFilter: () => {
    set({ filter: {} });
    get().fetchBills(true);
  },

  refresh: () => {
    get().fetchBills(true);
  },
}));
