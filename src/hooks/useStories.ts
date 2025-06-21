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
  user_id?: string;
}

interface SavedStory extends Story {
  saved_at: string;
}

interface UseStoriesReturn {
  stories: Story[];
  savedStories: SavedStory[];
  loading: boolean;
  error: string | null;
  refreshStories: () => Promise<void>;
  refreshSavedStories: () => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  saveStory: (storyId: string) => Promise<void>;
  unsaveStory: (storyId: string) => Promise<void>;
  isStorySaved: (storyId: string) => boolean;
}

export const useStories = (): UseStoriesReturn => {
  const [stories, setStories] = useState<Story[]>([]);
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
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
        .eq('user_id', user.id)
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

  const fetchSavedStories = async () => {
    if (!user) {
      setSavedStories([]);
      return;
    }

    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('saved_stories')
        .select(`
          created_at,
          stories (
            id,
            title,
            theme,
            character,
            language,
            custom_prompt,
            story_text,
            image_url,
            audio_url,
            created_at,
            updated_at,
            user_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to match our SavedStory interface
      const transformedData = (data || []).map(item => ({
        ...item.stories,
        saved_at: item.created_at
      })) as SavedStory[];

      setSavedStories(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch saved stories';
      setError(errorMessage);
      console.error('Error fetching saved stories:', err);
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
      setSavedStories(prev => prev.filter(story => story.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete story';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const saveStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error: saveError } = await supabase
        .from('saved_stories')
        .insert({
          user_id: user.id,
          story_id: storyId
        });

      if (saveError) {
        throw saveError;
      }

      // Refresh saved stories to get the updated list
      await fetchSavedStories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save story';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const unsaveStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error: unsaveError } = await supabase
        .from('saved_stories')
        .delete()
        .eq('user_id', user.id)
        .eq('story_id', storyId);

      if (unsaveError) {
        throw unsaveError;
      }

      // Remove from local state
      setSavedStories(prev => prev.filter(story => story.id !== storyId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsave story';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const isStorySaved = (storyId: string): boolean => {
    return savedStories.some(story => story.id === storyId);
  };

  const refreshStories = async () => {
    await fetchStories();
  };

  const refreshSavedStories = async () => {
    await fetchSavedStories();
  };

  useEffect(() => {
    if (user) {
      fetchStories();
      fetchSavedStories();
    } else {
      setStories([]);
      setSavedStories([]);
      setLoading(false);
    }
  }, [user]);

  return {
    stories,
    savedStories,
    loading,
    error,
    refreshStories,
    refreshSavedStories,
    deleteStory,
    saveStory,
    unsaveStory,
    isStorySaved,
  };
};