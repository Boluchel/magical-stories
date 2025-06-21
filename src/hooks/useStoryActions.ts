import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UseStoryActionsReturn {
  saveStory: (storyId: string) => Promise<void>;
  unsaveStory: (storyId: string) => Promise<void>;
  checkIfSaved: (storyId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const useStoryActions = (): UseStoryActionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const saveStory = async (storyId: string) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      setLoading(true);
      setError(null);

      // Check if already saved
      const { data: existing } = await supabase
        .from('saved_stories')
        .select('id')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .maybeSingle();

      if (existing) {
        return; // Already saved
      }

      const { error: saveError } = await supabase
        .from('saved_stories')
        .insert({
          user_id: user.id,
          story_id: storyId
        });

      if (saveError) {
        throw saveError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save story';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const unsaveStory = async (storyId: string) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('saved_stories')
        .delete()
        .eq('user_id', user.id)
        .eq('story_id', storyId);

      if (deleteError) {
        throw deleteError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsave story';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async (storyId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const { data } = await supabase
        .from('saved_stories')
        .select('id')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .maybeSingle();

      return !!data;
    } catch {
      return false;
    }
  };

  return {
    saveStory,
    unsaveStory,
    checkIfSaved,
    loading,
    error,
  };
};