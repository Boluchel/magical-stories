import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Heart, Share2, Volume2, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface Story {
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

const StoryDisplay = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const currentStory = localStorage.getItem('currentStory');
    if (currentStory) {
      try {
        const parsedStory = JSON.parse(currentStory);
        setStory(parsedStory);
      } catch (error) {
        console.error('Error parsing story data:', error);
        navigate('/create');
      }
    } else {
      navigate('/create');
    }
  }, [navigate]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control actual audio playback
    // For now, we'll simulate audio playback
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, this would save to user's favorites
  };

  const handleShare = () => {
    if (navigator.share && story) {
      navigator.share({
        title: story.title,
        text: `Check out this magical story: ${story.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Story link copied to clipboard! 🌟');
      }).catch(() => {
        alert('Story shared! 🌟');
      });
    }
  };

  if (!story) {
    return (
      <div className={`min-h-screen px-4 py-8 flex items-center justify-center transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <div className={`text-center backdrop-blur-sm rounded-3xl p-12 border-2 shadow-lg transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-purple-400' 
            : 'bg-white/80 border-purple-100'
        }`}>
          <h2 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>Loading Your Story...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-4 py-8 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/create"
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-700/60 border border-purple-400 text-gray-200 hover:bg-gray-700/80'
                : 'bg-white/60 border border-purple-200 text-gray-700 hover:bg-white/80'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Create Another Story</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl sm:text-5xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {story.title}
          </h1>
          <div className={`backdrop-blur-sm rounded-full px-6 py-2 inline-block border-2 shadow-md transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-purple-400 text-gray-200' 
              : 'bg-white/80 border-purple-200 text-gray-700'
          }`}>
            <span className="font-medium">
              Theme: {story.theme} • Character: {story.character} • Language: {story.language}
            </span>
          </div>
        </div>

        {/* Story Content */}
        <div className={`backdrop-blur-sm rounded-3xl p-8 border-2 shadow-lg mb-8 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-purple-400' 
            : 'bg-white/80 border-purple-100'
        }`}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Story Text */}
            <div className="space-y-6">
              <div className={`text-lg leading-relaxed space-y-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {story.storyText.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Audio Controls */}
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
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePlayPause}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isPlaying
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" />
                    )}
                  </button>
                  
                  <div className={`flex-1 rounded-full h-2 transition-colors duration-300 ${
                    isDarkMode ? 'bg-purple-800' : 'bg-purple-200'
                  }`}>
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: isPlaying ? '45%' : '0%' }}
                    ></div>
                  </div>
                  
                  <button
                    onClick={() => setIsPlaying(false)}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-purple-800 hover:bg-purple-700' 
                        : 'bg-purple-200 hover:bg-purple-300'
                    }`}
                  >
                    <RotateCcw className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`} />
                  </button>
                </div>

                {story.audioUrl === 'audio_generated' && (
                  <p className={`text-xs mt-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    ✨ Audio narration was generated for this story!
                  </p>
                )}
              </div>
            </div>

            {/* Story Image */}
            <div className="space-y-6">
              <div className={`rounded-2xl p-4 border-2 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-purple-900/50 border-purple-400' 
                  : 'bg-purple-50 border-purple-200'
              }`}>
                {story.imageUrl ? (
                  <img
                    src={story.imageUrl}
                    alt="AI-generated story illustration"
                    className="w-full h-64 sm:h-80 object-cover rounded-xl"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/3568518/pexels-photo-3568518.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop";
                    }}
                  />
                ) : (
                  <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">🎨</div>
                      <p className="font-medium">AI Illustration</p>
                      <p className="text-sm opacity-80">Generated for your story</p>
                    </div>
                  </div>
                )}
                <p className={`text-sm mt-2 text-center transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  AI-Generated Story Illustration
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleSave}
                  className={`flex items-center justify-center space-x-2 py-3 px-2 md:px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    isSaved
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700/60 border-2 border-pink-400 text-gray-200 hover:bg-gray-700/80'
                        : 'bg-white/60 border-2 border-pink-200 text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved!' : 'Save Story'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gray-700/60 border-2 border-blue-400 text-gray-200 hover:bg-gray-700/80'
                      : 'bg-white/60 border-2 border-blue-200 text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/create"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-2 md:px-6 rounded-xl text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Create New Story
                </Link>

                <Link
                  to="/saved"
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-2 md:px-6 rounded-xl text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  View Saved Stories
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Story Details */}
        {story.customPrompt && (
          <div className={`backdrop-blur-sm rounded-2xl p-6 border-2 shadow-lg transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-purple-400' 
              : 'bg-white/80 border-purple-100'
          }`}>
            <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>Your Custom Ideas</h3>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              "{story.customPrompt}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDisplay;