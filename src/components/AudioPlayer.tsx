import React from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Loader2, SkipBack, SkipForward } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume?: number;
  isMuted?: boolean;
  loading: boolean;
  error: string | null;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onToggleMute?: () => void;
  onGenerateAudio: () => void;
  hasAudio: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying,
  currentTime,
  duration,
  progress,
  volume = 1,
  isMuted = false,
  loading,
  error,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onVolumeChange,
  onToggleMute,
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onVolumeChange) {
      const newVolume = parseFloat(e.target.value);
      onVolumeChange(newVolume);
    }
  };

  const handleSkipBackward = () => {
    const newTime = Math.max(0, currentTime - 10);
    onSeek(newTime);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    onSeek(newTime);
  };

  return (
    <div className={`rounded-xl p-6 border-2 transition-colors duration-300 shadow-lg ${
      isDarkMode 
        ? 'bg-gray-800/90 border-blue-400 shadow-blue-400/20' 
        : 'bg-blue-50/90 border-blue-200 shadow-blue-200/30'
    }`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 rounded-full ${
          isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
        }`}>
          <Volume2 className="w-6 h-6 text-white" />
        </div>
        <h3 className={`font-bold text-xl transition-colors duration-300 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Story Narration
        </h3>
      </div>

      {error && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-red-900/30 border-red-400 text-red-200' 
            : 'bg-red-50 border-red-400 text-red-700'
        }`}>
          <div className="flex items-start space-x-3">
            <VolumeX className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Audio Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!hasAudio && !loading && !error && (
        <div className="text-center">
          <div className={`mb-4 p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-white/70'
          }`}>
            <Volume2 className={`w-12 h-12 mx-auto mb-3 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-500'
            }`} />
            <p className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Transform your story into an immersive audio experience with AI narration
            </p>
          </div>
          <button
            onClick={onGenerateAudio}
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-600/30'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-blue-500/30'
            }`}
          >
            <Volume2 className="w-6 h-6" />
            <span>Generate Audio Narration</span>
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className={`inline-flex items-center space-x-4 p-6 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-white/70'
          }`}>
            <Loader2 className={`w-8 h-8 animate-spin transition-colors duration-300 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div className="text-left">
              <p className={`font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>
                Creating Audio Narration
              </p>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                AI is bringing your story to life...
              </p>
            </div>
          </div>
        </div>
      )}

      {hasAudio && !loading && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div 
              className={`w-full h-4 rounded-full cursor-pointer transition-colors duration-300 relative overflow-hidden ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
              }`}
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-150 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full shadow-lg transform translate-x-2 -translate-y-0"></div>
              </div>
            </div>
            
            {/* Time Display */}
            <div className={`flex justify-between text-sm font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={handleSkipBackward}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                isDarkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Skip back 10 seconds"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={onStop}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                isDarkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Stop"
            >
              <Square className="w-5 h-5" />
            </button>

            <button
              onClick={isPlaying ? onPause : onPlay}
              className={`p-5 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-600/30'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-blue-500/30'
              }`}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 ml-0.5" />
              )}
            </button>

            <button
              onClick={handleSkipForward}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                isDarkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Skip forward 10 seconds"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          {onVolumeChange && onToggleMute && (
            <div className={`flex items-center space-x-4 p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'
            }`}>
              <button
                onClick={onToggleMute}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${(isMuted ? 0 : volume) * 100}%, ${isDarkMode ? '#4b5563' : '#e5e7eb'} ${(isMuted ? 0 : volume) * 100}%, ${isDarkMode ? '#4b5563' : '#e5e7eb'} 100%)`
                  }}
                />
              </div>
              
              <span className={`text-sm font-medium min-w-[3rem] text-right ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;