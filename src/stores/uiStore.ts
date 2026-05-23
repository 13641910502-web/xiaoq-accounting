import { create } from 'zustand';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface UIState {
  isGlobalLoading: boolean;
  toasts: ToastMessage[];
  showGlobalLoading: () => void;
  hideGlobalLoading: () => void;
  showToast: (type: ToastMessage['type'], message: string) => void;
  dismissToast: (id: string) => void;
}

let toastIdCounter = 0;

export const useUIStore = create<UIState>((set) => ({
  isGlobalLoading: false,
  toasts: [],

  showGlobalLoading: () => set({ isGlobalLoading: true }),
  hideGlobalLoading: () => set({ isGlobalLoading: false }),

  showToast: (type, message) => {
    const id = `toast_${++toastIdCounter}`;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
