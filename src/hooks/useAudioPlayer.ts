import { useState, useRef, useEffect, useCallback } from 'react';

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
  const audioUrlRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up audio player');
    
    if (audioRef.current) {
      // Remove all event listeners
      audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
      audioRef.current.removeEventListener('ended', handleEnded);
      audioRef.current.removeEventListener('error', handleError);
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.removeEventListener('play', handlePlay);
      audioRef.current.removeEventListener('pause', handlePause);
      
      // Pause and reset
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
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
    isInitializedRef.current = false;
  }, []);

  // Event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      console.log('Audio metadata loaded, duration:', audioRef.current.duration);
      setDuration(audioRef.current.duration);
      setHasAudio(true);
      isInitializedRef.current = true;
    }
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    console.log('Audio can play through');
    setHasAudio(true);
    isInitializedRef.current = true;
  }, []);

  const handleEnded = useCallback(() => {
    console.log('Audio playback ended');
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleError = useCallback((e: Event) => {
    console.error('Audio element error:', e);
    setError('Audio playback failed');
    setIsPlaying(false);
    setHasAudio(false);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handlePlay = useCallback(() => {
    console.log('Audio play event fired');
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    console.log('Audio pause event fired');
    setIsPlaying(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const play = async () => {
    if (!audioRef.current || !hasAudio || !isInitializedRef.current) {
      console.log('Cannot play: audio not ready', { 
        hasAudio: !!audioRef.current, 
        hasAudioState: hasAudio, 
        initialized: isInitializedRef.current 
      });
      return;
    }

    try {
      console.log('Attempting to play audio...');
      setError(null);
      
      // Ensure we're not already playing
      if (!audioRef.current.paused) {
        console.log('Audio is already playing');
        return;
      }

      await audioRef.current.play();
      console.log('Audio play() succeeded');
    } catch (err) {
      console.error('Audio play error:', err);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const pause = () => {
    if (audioRef.current && !audioRef.current.paused) {
      console.log('Pausing audio...');
      audioRef.current.pause();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      console.log('Stopping audio...');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current && hasAudio && isInitializedRef.current) {
      console.log('Seeking to:', time);
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
        let errorMessage = 'Failed to generate audio';
        try {
          const errorData = await response.json();
          if (errorData.userMessage) {
            errorMessage = errorData.userMessage;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          if (response.status === 503) {
            errorMessage = 'Audio generation service is temporarily unavailable. Please try again later.';
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = 'Audio generation service authentication failed. Please contact support.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const audioBlob = await response.blob();
      
      if (audioBlob.size === 0) {
        throw new Error('No audio data received from the service');
      }
      
      console.log('Audio blob received, size:', audioBlob.size);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create new audio element
      const audio = new Audio();
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      // Set the source and load
      audio.src = audioUrl;
      audio.load();

      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'));
        }, 15000);

        const checkReady = () => {
          if (audio.readyState >= 3) { // HAVE_FUTURE_DATA
            clearTimeout(timeout);
            console.log('Audio is ready to play');
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };

        const handleLoadError = () => {
          clearTimeout(timeout);
          reject(new Error('Audio loading failed'));
        };

        audio.addEventListener('error', handleLoadError, { once: true });
        
        if (audio.readyState >= 3) {
          clearTimeout(timeout);
          resolve();
        } else {
          checkReady();
        }
      });

      console.log('Audio generation and setup complete');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate audio';
      console.error('Audio generation error:', err);
      setError(errorMessage);
      cleanup();
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