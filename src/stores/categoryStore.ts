import { create } from 'zustand';
import type { Category } from '../types/category';
import * as categoryDb from '../services/database/categories';

interface CategoryState {
  mainCategories: Category[];
  subCategories: Record<string, Category[]>;
  allCategories: Category[];
  isLoading: boolean;

  loadCategories: () => void;
  loadSubCategories: (parentId: string) => void;
  addCategory: (name: string, type: 'main' | 'sub', parentId: string | null, icon: string, color: string) => Category;
  updateCategory: (id: string, updates: { name?: string; icon?: string; color?: string }) => void;
  removeCategory: (id: string) => void;
  getCategoryByName: (name: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  mainCategories: [],
  subCategories: {},
  allCategories: [],
  isLoading: false,

  loadCategories: () => {
    set({ isLoading: true });
    try {
      const mainCategories = categoryDb.getMainCategories();
      const allCategories = categoryDb.getAllCategories();
      set({ mainCategories, allCategories, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadSubCategories: (parentId: string) => {
    const subs = categoryDb.getSubCategories(parentId);
    set(state => ({
      subCategories: { ...state.subCategories, [parentId]: subs },
    }));
  },

  addCategory: (name, type, parentId, icon, color) => {
    const cat = categoryDb.addCategory(name, type, parentId, icon, color);
    get().loadCategories();
    return cat;
  },

  updateCategory: (id, updates) => {
    categoryDb.updateCategory(id, updates);
    get().loadCategories();
  },

  removeCategory: (id) => {
    categoryDb.deleteCategory(id);
    get().loadCategories();
  },

  getCategoryByName: (name) => {
    return get().allCategories.find(c => c.name === name);
  },
}));
