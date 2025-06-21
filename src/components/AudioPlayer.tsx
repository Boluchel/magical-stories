import React from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Loader2 } from 'lucide-react';
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      onSeek(newTime);
    }
  };

  return (
    <div className={`rounded-xl p-4 border-2 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-700/60 border-blue-400' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center space-x-2 mb-2">
        <Volume2 className={`w-5 h-5 transition-colors duration-300 ${
          isDarkMode ? 'text-blue-300' : 'text-blue-600'
        }`} />
        <h3 className={`font-semibold transition-colors duration-300 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Story Narration
        </h3>
      </div>

      {error && (
        <div className={`mb-3 p-3 rounded-lg border transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-red-900/50 border-red-400 text-red-200' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            <VolumeX className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {!hasAudio && !loading && !error && (
        <button
          onClick={onGenerateAudio}
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Audio...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span>Generate Audio Narration</span>
            </>
          )}
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center space-x-2 py-3">
          <Loader2 className={`w-5 h-5 animate-spin transition-colors duration-300 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-600'
          }`} />
          <span className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Generating audio narration...
          </span>
        </div>
      )}

      {hasAudio && !loading && (
        <div className="space-y-3">
          {/* Progress Bar */}
          <div 
            className={`w-full h-2 rounded-full cursor-pointer transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
            }`}
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time Display */}
          <div className={`flex justify-between text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onStop}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                isDarkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              onClick={isPlaying ? onPause : onPlay}
              className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;