import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Trash2, Plus, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SavedStories = () => {
  const { isDarkMode } = useTheme();
  
  // Sample saved stories data - in a real app, this would come from a database
  const [savedStories] = useState([
    {
      id: 1,
      title: "The Dragon's Magical Adventure",
      theme: "dragons",
      character: "hero",
      language: "english",
      thumbnail: "https://images.pexels.com/photos/3568518/pexels-photo-3568518.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      createdAt: "2024-01-15",
      duration: "3:45"
    },
    {
      id: 2,
      title: "Space Explorer Maya",
      theme: "space",
      character: "hero",
      language: "spanish",
      thumbnail: "https://images.pexels.com/photos/586688/pexels-photo-586688.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      createdAt: "2024-01-14",
      duration: "4:12"
    },
    {
      id: 3,
      title: "The Fairy's Secret Garden",
      theme: "fairies",
      character: "princess",
      language: "french",
      thumbnail: "https://images.pexels.com/photos/1376930/pexels-photo-1376930.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      createdAt: "2024-01-13",
      duration: "2:58"
    },
    {
      id: 4,
      title: "Pirate Captain Whiskers",
      theme: "pirates",
      character: "animal",
      language: "english",
      thumbnail: "https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      createdAt: "2024-01-12",
      duration: "5:20"
    },
    {
      id: 5,
      title: "Underwater Kingdom",
      theme: "underwater",
      character: "animal",
      language: "german",
      thumbnail: "https://images.pexels.com/photos/934718/pexels-photo-934718.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      createdAt: "2024-01-11",
      duration: "3:33"
    },
    {
      id: 6,
      title: "Robot's First Day",
      theme: "space",
      character: "robot",
      language: "italian",
      thumbnail: "https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      createdAt: "2024-01-10",
      duration: "4:05"
    }
  ]);

  const [playingId, setPlayingId] = useState<number | null>(null);

  const handlePlay = (id: number) => {
    setPlayingId(playingId === id ? null : id);
    // In a real app, this would start/stop audio playback
  };

  const handleDelete = (id: number) => {
    // In a real app, this would delete the story
    console.log('Delete story:', id);
  };

  const getThemeEmoji = (theme: string) => {
    const emojis: { [key: string]: string } = {
      dragons: '🐉',
      space: '🚀',
      fairies: '🧚‍♀️',
      pirates: '🏴‍☠️',
      animals: '🦁',
      underwater: '🌊'
    };
    return emojis[theme] || '⭐';
  };

  const getLanguageFlag = (language: string) => {
    const flags: { [key: string]: string } = {
      english: '🇺🇸',
      spanish: '🇪🇸',
      french: '🇫🇷',
      german: '🇩🇪',
      italian: '🇮🇹',
      portuguese: '🇵🇹'
    };
    return flags[language] || '🌍';
  };

  return (
    <div className={`min-h-screen px-4 py-8 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl sm:text-6xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Your Story
            <span className="bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent">
              {' '}Collection
            </span>
          </h1>
          <p className={`text-xl font-medium mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            All your magical adventures in one place! ✨
          </p>
          
          <Link
            to="/create"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Story</span>
          </Link>
        </div>

        {/* Stories Grid */}
        {savedStories.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedStories.map((story) => (
              <div
                key={story.id}
                className={`backdrop-blur-sm rounded-2xl overflow-hidden border-2 hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isDarkMode 
                    ? 'bg-gray-800/80 border-purple-400' 
                    : 'bg-white/80 border-purple-100'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={story.thumbnail}
                    alt={story.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <button
                    onClick={() => handlePlay(story.id)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="bg-white/90 rounded-full p-4 transform hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-purple-600 ml-1" />
                    </div>
                  </button>

                  {/* Theme & Language Badges */}
                  <div className="absolute top-3 left-3 flex space-x-2">
                    <span className="bg-purple-500/80 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-full">
                      {getThemeEmoji(story.theme)}
                    </span>
                    <span className="bg-blue-500/80 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-full">
                      {getLanguageFlag(story.language)}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3">
                    <span className="bg-black/60 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-full">
                      {story.duration}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-2 line-clamp-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {story.title}
                  </h3>
                  
                  <p className={`text-sm mb-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Created on {new Date(story.createdAt).toLocaleDateString()}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePlay(story.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                        playingId === story.id
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      <span>{playingId === story.id ? 'Playing...' : 'Play'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(story.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-lg transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button className="p-2 bg-pink-100 hover:bg-pink-200 text-pink-600 hover:text-pink-700 rounded-lg transition-all duration-300">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className={`backdrop-blur-sm rounded-3xl p-12 border-2 shadow-lg max-w-md mx-auto transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/80 border-purple-400' 
                : 'bg-white/80 border-purple-100'
            }`}>
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>No Stories Yet</h3>
              <p className={`mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your magical story collection is empty. Create your first adventure!
              </p>
              <Link
                to="/create"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Story</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedStories;