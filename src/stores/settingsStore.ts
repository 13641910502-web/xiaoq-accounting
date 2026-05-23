import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface SettingsState {
  apiKey: string | null;
  apiKeyLoaded: boolean;
  useAI: boolean;
  darkMode: boolean;
  currency: string;

  loadApiKey: () => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
  setUseAI: (use: boolean) => void;
  setDarkMode: (dark: boolean) => void;
}

const API_KEY_STORE = 'claude_api_key';

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKey: null,
  apiKeyLoaded: false,
  useAI: true,
  darkMode: false,
  currency: 'CNY',

  loadApiKey: async () => {
    try {
      const key = await SecureStore.getItemAsync(API_KEY_STORE);
      set({ apiKey: key, apiKeyLoaded: true });
    } catch {
      set({ apiKeyLoaded: true });
    }
  },

  setApiKey: async (key: string) => {
    await SecureStore.setItemAsync(API_KEY_STORE, key);
    set({ apiKey: key });
  },

  clearApiKey: async () => {
    await SecureStore.deleteItemAsync(API_KEY_STORE);
    set({ apiKey: null });
  },

  setUseAI: (useAI) => set({ useAI }),

  setDarkMode: (darkMode) => set({ darkMode }),
}));
