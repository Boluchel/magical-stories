import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Heart, Trash2, Plus, BookOpen, Loader2, Volume2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useStories } from '../hooks/useStories';

const SavedStories = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stories, loading, error, refreshStories, deleteStory } = useStories();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handlePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
    // In a real app, this would start/stop audio playback
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteStory(id);
    } catch (error) {
      console.error('Failed to delete story:', error);
      alert('Failed to delete story. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewStory = (story: any) => {
    // Store the story data for the display page
    localStorage.setItem('currentStory', JSON.stringify({
      id: story.id,
      title: story.title,
      theme: story.theme,
      character: story.character,
      language: story.language,
      customPrompt: story.custom_prompt,
      storyText: story.story_text,
      imageUrl: story.image_url,
      audioUrl: story.audio_url,
      createdAt: story.created_at
    }));
    navigate('/story');
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

  // Redirect to auth if not logged in
  if (!user) {
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
          }`}>Login Required</h2>
          <p className={`text-lg mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Please log in to view your saved stories!
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Go to Login
          </button>
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

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl max-w-2xl mx-auto">
            <p className="font-medium">Error Loading Stories</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={refreshStories}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className={`text-center backdrop-blur-sm rounded-3xl p-12 border-2 shadow-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/80 border-purple-400' 
                : 'bg-white/80 border-purple-100'
            }`}>
              <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
              <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Loading Your Stories...</h3>
              <p className={`transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Gathering your magical adventures
              </p>
            </div>
          </div>
        ) : stories.length > 0 ? (
          /* Stories Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
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
                  {story.image_url ? (
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/3568518/pexels-photo-3568518.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-3xl mb-2">{getThemeEmoji(story.theme)}</div>
                        <p className="font-medium">AI Generated</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <button
                    onClick={() => handleViewStory(story)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="bg-white/90 rounded-full p-4 transform hover:scale-110 transition-transform">
                      <BookOpen className="w-8 h-8 text-purple-600" />
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

                  {/* Audio Indicator */}
                  {story.audio_url && (
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-green-500/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Volume2 className="w-3 h-3 mr-1" />
                        Audio
                      </span>
                    </div>
                  )}
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
                    Created on {new Date(story.created_at).toLocaleDateString()}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewStory(story)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-300 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Read</span>
                    </button>

                    <button
                      onClick={() => handlePlay(story.id)}
                      disabled={!story.audio_url}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        story.audio_url
                          ? playingId === story.id
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(story.id)}
                      disabled={deletingId === story.id}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {deletingId === story.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
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
                Your magical story collection is empty. Create your first adventure with AI!
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