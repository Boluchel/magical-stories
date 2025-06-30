import { useState } from 'react';

interface UseStoryActionsReturn {
  loading: boolean;
  error: string | null;
}

export const useStoryActions = (): UseStoryActionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    loading,
    error,
  };
};