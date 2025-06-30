import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface StoryGenerationRequest {
  theme: string;
  character: string;
  language: string;
  customPrompt?: string;
}

interface GeneratedStory {
  id: string;
  title: string;
  theme: string;
  character: string;
  language: string;
  customPrompt: string;
  storyText: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: string;
}

interface UseStoryGenerationReturn {
  generateStory: (request: StoryGenerationRequest) => Promise<GeneratedStory>;
  loading: boolean;
  error: string | null;
  warning: string | null;
}

export const useStoryGeneration = (): UseStoryGenerationReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const generateStory = async (request: StoryGenerationRequest): Promise<GeneratedStory> => {
    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      // Get the current user's session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Authentication required. Please log in to generate stories.');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Prioritize the details field if available, otherwise fall back to error field
        const errorMessage = errorData.details || errorData.error || 'Story generation failed';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success) {
        // Prioritize the details field if available, otherwise fall back to error field
        const errorMessage = data.details || data.error || 'Story generation failed';
        throw new Error(errorMessage);
      }

      // Check for warnings (like demo mode)
      if (data.warning) {
        setWarning(data.warning);
      }

      return data.story;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    generateStory,
    loading,
    error,
    warning,
  };
};