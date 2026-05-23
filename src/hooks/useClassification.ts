import { useState, useCallback } from 'react';
import { classifyTransaction, classifyBatch } from '../services/classification/engine';
import type { ClassificationResult } from '../types/classification';

interface UseClassificationReturn {
  classifying: boolean;
  result: ClassificationResult | null;
  classify: (description: string) => Promise<ClassificationResult>;
  classifyMultiple: (descriptions: string[]) => Promise<ClassificationResult[]>;
  reset: () => void;
}

export function useClassification(): UseClassificationReturn {
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const classify = useCallback(async (description: string) => {
    setClassifying(true);
    try {
      const res = await classifyTransaction(description);
      setResult(res);
      return res;
    } finally {
      setClassifying(false);
    }
  }, []);

  const classifyMultiple = useCallback(async (descriptions: string[]) => {
    setClassifying(true);
    try {
      const results = await classifyBatch(descriptions);
      return results;
    } finally {
      setClassifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setClassifying(false);
  }, []);

  return { classifying, result, classify, classifyMultiple, reset };
}
