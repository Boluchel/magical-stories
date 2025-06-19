import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Story {
  id: string;
  title: string;
  theme: string;
  character: string;
  language: string;
  custom_prompt: string;
  story_text: string;
  image_url?: string;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

interface UseStoriesReturn {
  stories: Story[];
  loading: boolean;
  error: string | null;
  refreshStories: () => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
}

export const useStories = (): UseStoriesReturn => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStories = async () => {
    if (!user) {
      setStories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setStories(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stories';
      setError(errorMessage);
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('stories')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Remove from local state
      setStories(prev => prev.filter(story => story.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete story';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshStories = async () => {
    await fetchStories();
  };

  useEffect(() => {
    fetchStories();
  }, [user]);

  return {
    stories,
    loading,
    error,
    refreshStories,
    deleteStory,
  };
};