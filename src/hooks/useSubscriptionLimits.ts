import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SubscriptionLimits {
  canCreate: boolean;
  isSubscribed: boolean;
  dailyCount: number;
  dailyLimit: number;
  remaining: number;
}

interface UseSubscriptionLimitsReturn {
  limits: SubscriptionLimits | null;
  loading: boolean;
  error: string | null;
  refreshLimits: () => Promise<void>;
}

export const useSubscriptionLimits = (): UseSubscriptionLimitsReturn => {
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLimits = async () => {
    if (!user) {
      setLimits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('can_create_story', { user_uuid: user.id });

      if (fetchError) {
        throw fetchError;
      }

      setLimits({
        canCreate: data.can_create,
        isSubscribed: data.is_subscribed,
        dailyCount: data.daily_count,
        dailyLimit: data.daily_limit,
        remaining: data.remaining
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription limits';
      setError(errorMessage);
      console.error('Error fetching subscription limits:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshLimits = async () => {
    await fetchLimits();
  };

  useEffect(() => {
    fetchLimits();
  }, [user]);

  return {
    limits,
    loading,
    error,
    refreshLimits,
  };
};