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
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
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

      // Stop current audio if playing
      if (audioRef.current) {
        stop();
        audioRef.current = null;
      }

      console.log('Generating audio for text:', text.substring(0, 100) + '...');

      // Generate audio using ElevenLabs via edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text, language }),
      });

      console.log('Audio generation response status:', response.status);

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
          
          // If it's a demo/configuration issue, show a helpful message
          if (errorData.demo) {
            errorMessage = "Audio generation is not configured. This is a demo version - please configure PicaOS API keys to enable audio narration.";
          }
        } catch (parseError) {
          // If we can't parse the error, use a generic message based on status
          if (response.status === 503) {
            errorMessage = 'Audio generation service is temporarily unavailable. Please try again later.';
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = 'Audio generation service authentication failed. Please contact support.';
          } else if (response.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          }
        }
        
        throw new Error(errorMessage);
      }

      // Check if response is JSON (error) or audio blob
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.userMessage || errorData.error || 'Audio generation failed');
      }

      const audioBlob = await response.blob();
      
      // Check if we actually got audio data
      if (audioBlob.size === 0) {
        throw new Error('No audio data received from the service');
      }
      
      console.log('Audio blob received, size:', audioBlob.size);
      
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        setDuration(audio.duration);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        stopTimeTracking();
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setError('Audio playback failed');
        setIsPlaying(false);
        stopTimeTracking();
      });

      // Wait for audio to load
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'));
        }, 15000); // 15 second timeout

        audio.addEventListener('canplaythrough', () => {
          clearTimeout(timeout);
          console.log('Audio can play through');
          resolve(undefined);
        });
        
        audio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          console.error('Audio loading error:', e);
          reject(new Error('Audio loading failed'));
        });
        
        audio.load();
      });

      // Auto-play the generated audio
      console.log('Starting audio playback');
      await play();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate audio';
      console.error('Audio generation error:', err);
      setError(errorMessage);
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
  };
};