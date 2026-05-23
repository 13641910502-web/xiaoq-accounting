import { create } from 'zustand';
import type { ImportState, ImportStep, OcrResult } from '../types/import';

interface ImportStoreState extends ImportState {
  setStep: (step: ImportStep) => void;
  setSource: (source: ImportState['source']) => void;
  setResults: (results: OcrResult[]) => void;
  addResult: (result: OcrResult) => void;
  updateResult: (index: number, updates: Partial<OcrResult>) => void;
  removeResult: (index: number) => void;
  setImageUri: (uri: string | null) => void;
  setCsvFile: (file: string | null) => void;
  setBatchId: (id: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: ImportState = {
  step: 'idle',
  source: null,
  results: [],
  imageUri: null,
  csvFile: null,
  batchId: null,
  error: null,
};

export const useImportStore = create<ImportStoreState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setSource: (source) => set({ source }),
  setResults: (results) => set({ results }),
  addResult: (result) => set((state) => ({ results: [...state.results, result] })),
  updateResult: (index, updates) => set((state) => {
    const results = [...state.results];
    results[index] = { ...results[index], ...updates };
    return { results };
  }),
  removeResult: (index) => set((state) => ({
    results: state.results.filter((_, i) => i !== index),
  })),
  setImageUri: (imageUri) => set({ imageUri }),
  setCsvFile: (csvFile) => set({ csvFile }),
  setBatchId: (batchId) => set({ batchId }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
