import { useState, useRef, useEffect } from 'react';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  generateAndPlayAudio: (text: string, language: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  hasAudio: boolean;
  cleanup: () => void;
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Cleanup function
  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('loadedmetadata', () => {});
      audioRef.current.removeEventListener('ended', () => {});
      audioRef.current.removeEventListener('error', () => {});
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setHasAudio(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const startTimeTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(updateTime, 100);
  };

  const stopTimeTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const play = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        startTimeTracking();
      } catch (err) {
        setError('Failed to play audio');
        console.error('Audio play error:', err);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopTimeTracking();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      stopTimeTracking();
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const generateAndPlayAudio = async (text: string, language: string) => {
    try {
      setLoading(true);
      setError(null);

      // Clean up any existing audio
      cleanup();

      // Generate audio using ElevenLabs via edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        // Try to get user-friendly error message from response
        let errorMessage = 'Failed to generate audio';
        try {
          const errorData = await response.json();
          if (errorData.userMessage) {
            errorMessage = errorData.userMessage;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If we can't parse the error, use a generic message
          if (response.status === 503) {
            errorMessage = 'Audio generation service is temporarily unavailable. Please try again later.';
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = 'Audio generation service authentication failed. Please contact support.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const audioBlob = await response.blob();
      
      // Check if we actually got audio data
      if (audioBlob.size === 0) {
        throw new Error('No audio data received from the service');
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setHasAudio(true); // Set hasAudio to true when metadata is loaded
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        stopTimeTracking();
      };

      const handleError = () => {
        setError('Audio playback failed');
        setIsPlaying(false);
        stopTimeTracking();
        setHasAudio(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      // Wait for audio to load
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'));
        }, 10000); // 10 second timeout

        const handleCanPlayThrough = () => {
          clearTimeout(timeout);
          audio.removeEventListener('canplaythrough', handleCanPlayThrough);
          resolve(undefined);
        };
        
        const handleLoadError = () => {
          clearTimeout(timeout);
          audio.removeEventListener('error', handleLoadError);
          reject(new Error('Audio loading failed'));
        };
        
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('error', handleLoadError);
        
        audio.load();
      });

      // Auto-play the generated audio
      await play();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate audio';
      setError(errorMessage);
      console.error('Audio generation error:', err);
      cleanup(); // Clean up on error
    } finally {
      setLoading(false);
    }
  };

  return {
    isPlaying,
    currentTime,
    duration,
    progress,
    play,
    pause,
    stop,
    seek,
    generateAndPlayAudio,
    loading,
    error,
    hasAudio,
    cleanup,
  };
};