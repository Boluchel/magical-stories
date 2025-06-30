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
    if (audioRef.current && hasAudio) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        startTimeTracking();
        setError(null);
      } catch (err) {
        console.error('Audio play error:', err);
        setError('Failed to play audio');
        setIsPlaying(false);
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
    if (audioRef.current && hasAudio) {
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

      console.log('Generating audio for text:', text.substring(0, 50) + '...');

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
      
      console.log('Audio blob received, size:', audioBlob.size);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners with proper cleanup
      const handleLoadedMetadata = () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        setDuration(audio.duration);
        setHasAudio(true);
      };

      const handleCanPlayThrough = () => {
        console.log('Audio can play through');
        setHasAudio(true);
      };

      const handleEnded = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
        setCurrentTime(0);
        stopTimeTracking();
      };

      const handleError = (e: Event) => {
        console.error('Audio element error:', e);
        setError('Audio playback failed');
        setIsPlaying(false);
        stopTimeTracking();
        setHasAudio(false);
      };

      const handleTimeUpdate = () => {
        if (audio.currentTime !== currentTime) {
          setCurrentTime(audio.currentTime);
        }
      };

      // Add event listeners
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('timeupdate', handleTimeUpdate);

      // Load the audio
      audio.load();

      // Wait for audio to be ready to play
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'));
        }, 15000); // 15 second timeout

        const handleReady = () => {
          clearTimeout(timeout);
          audio.removeEventListener('canplaythrough', handleReady);
          audio.removeEventListener('error', handleLoadError);
          console.log('Audio is ready to play');
          resolve();
        };
        
        const handleLoadError = (e: Event) => {
          clearTimeout(timeout);
          audio.removeEventListener('canplaythrough', handleReady);
          audio.removeEventListener('error', handleLoadError);
          console.error('Audio loading failed:', e);
          reject(new Error('Audio loading failed'));
        };
        
        // Check if already ready
        if (audio.readyState >= 3) { // HAVE_FUTURE_DATA or higher
          clearTimeout(timeout);
          resolve();
        } else {
          audio.addEventListener('canplaythrough', handleReady, { once: true });
          audio.addEventListener('error', handleLoadError, { once: true });
        }
      });

      console.log('Audio generation and setup complete');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate audio';
      console.error('Audio generation error:', err);
      setError(errorMessage);
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