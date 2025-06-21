import React from 'react';
import { Play, Pause, RotateCcw, Volume2, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  loading: boolean;
  error: string | null;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onGenerateAudio: () => void;
  hasAudio: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying,
  currentTime,
  duration,
  progress,
  loading,
  error,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onGenerateAudio,
  hasAudio,
}) => {
  const { isDarkMode } = useTheme();

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickRatio = clickX / rect.width;
      const newTime = clickRatio * duration;
      onSeek(newTime);
    }
  };

  return (
    <div className={`rounded-2xl p-6 border-2 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-purple-900/50 border-purple-400' 
        : 'bg-purple-50 border-purple-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Volume2 className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <span className={`font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>Story Narration</span>
        </div>
        <span className={`text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>ElevenLabs AI Voice</span>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center space-x-4">
        {!hasAudio ? (
          <button
            onClick={onGenerateAudio}
            disabled={loading}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>
        ) : (
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={loading}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : isPlaying
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>
        )}
        
        {hasAudio && (
          <>
            <div className="flex-1">
              <div 
                className={`relative rounded-full h-2 cursor-pointer transition-colors duration-300 ${
                  isDarkMode ? 'bg-purple-800' : 'bg-purple-200'
                }`}
                onClick={handleProgressClick}
              >
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-2 text-sm">
                <span className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatTime(currentTime)}
                </span>
                <span className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatTime(duration)}
                </span>
              </div>
            </div>
            
            <button
              onClick={onStop}
              className={`p-2 rounded-full transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-purple-800 hover:bg-purple-700' 
                  : 'bg-purple-200 hover:bg-purple-300'
              }`}
            >
              <RotateCcw className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`} />
            </button>
          </>
        )}
      </div>

      {!hasAudio && !loading && (
        <p className={`text-xs mt-2 transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Click the audio button to generate narration for this story
        </p>
      )}

      {hasAudio && (
        <p className={`text-xs mt-2 transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          ✨ Audio narration generated with ElevenLabs AI
        </p>
      )}
    </div>
  );
};

export default AudioPlayer;