import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, RotateCcw, Heart, Share2, Volume2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const StoryDisplay = () => {
  const { isDarkMode } = useTheme();
  const [storyData, setStoryData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sample story content - in a real app, this would come from AI generation
  const sampleStory = {
    title: "The Dragon's Magical Adventure",
    text: `Once upon a time, in a land filled with sparkling stars and rainbow clouds, there lived a friendly dragon named Sparkle. Unlike other dragons, Sparkle didn't breathe fire - she breathed magical glitter that made flowers bloom instantly!

One sunny morning, Sparkle discovered that all the colors had disappeared from her magical forest. The trees were gray, the flowers were white, and even the butterflies had lost their beautiful wings.

"I must find the Color Crystal!" declared Sparkle bravely. She spread her shimmering wings and flew high above the clouds, searching for the legendary crystal that could restore all colors to her world.

After flying for hours, Sparkle found a mysterious cave hidden behind a waterfall. Inside, she met a wise old owl who told her, "The Color Crystal is guarded by three riddles. Answer them correctly, and the colors will return!"

With courage in her heart and determination in her eyes, Sparkle solved each riddle using kindness, wisdom, and friendship. As she touched the Color Crystal, a magnificent rainbow burst across the sky, returning all the beautiful colors to her magical world.

From that day on, Sparkle became known as the Guardian of Colors, protecting the magic and beauty of her forest home forever.`,
    imageUrl: "https://images.pexels.com/photos/3568518/pexels-photo-3568518.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
  };

  useEffect(() => {
    const savedData = localStorage.getItem('storyData');
    if (savedData) {
      setStoryData(JSON.parse(savedData));
    }
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control ElevenLabs audio playback
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, this would save to user's story collection
  };

  const handleShare = () => {
    // In a real app, this would implement sharing functionality
    alert('Story shared! 🌟');
  };

  if (!storyData) {
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
          }`}>No Story Found</h2>
          <Link
            to="/create"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Create a Story
          </Link>
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl sm:text-5xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Your Magical Story
          </h1>
          <div className={`backdrop-blur-sm rounded-full px-6 py-2 inline-block border-2 shadow-md transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-purple-400 text-gray-200' 
              : 'bg-white/80 border-purple-200 text-gray-700'
          }`}>
            <span className="font-medium">
              Theme: {storyData.theme} • Character: {storyData.character} • Language: {storyData.language}
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
              <h2 className={`text-2xl sm:text-3xl font-bold mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {sampleStory.title}
              </h2>
              
              <div className={`text-lg leading-relaxed space-y-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {sampleStory.text.split('\n\n').map((paragraph, index) => (
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
                    onClick={handlePlayPause}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-purple-800 hover:bg-purple-700' 
                        : 'bg-purple-200 hover:bg-purple-300'
                    }`}
                  >
                    <RotateCcw className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Story Image */}
            <div className="space-y-6">
              <div className={`rounded-2xl p-4 border-2 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-purple-900/50 border-purple-400' 
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <img
                  src={sampleStory.imageUrl}
                  alt="Story illustration"
                  className="w-full h-64 sm:h-80 object-cover rounded-xl"
                />
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
                  className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
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
                  className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
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
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Create New Story
                </Link>

                <Link
                  to="/saved"
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-6 rounded-xl text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  View Saved Stories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDisplay;