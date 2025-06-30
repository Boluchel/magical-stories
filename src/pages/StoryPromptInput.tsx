import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wand2, Star, Hexagon as Dragon, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useStoryGeneration } from '../hooks/useStoryGeneration';

const StoryPromptInput = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { generateStory, loading, error, warning } = useStoryGeneration();
  
  const [formData, setFormData] = useState({
    theme: '',
    character: '',
    language: '',
    customPrompt: ''
  });

  // Clear any existing story data when component mounts
  useEffect(() => {
    localStorage.removeItem('currentStory');
  }, []);

  const themes = [
    { value: 'dragons', label: '🐉 Dragons & Magic', icon: '🐉' },
    { value: 'space', label: '🚀 Space Adventure', icon: '🚀' },
    { value: 'fairies', label: '🧚‍♀️ Fairy Tales', icon: '🧚‍♀️' },
    { value: 'pirates', label: '🏴‍☠️ Pirate Adventure', icon: '🏴‍☠️' },
    { value: 'animals', label: '🦁 Animal Friends', icon: '🦁' },
    { value: 'underwater', label: '🌊 Under the Sea', icon: '🌊' }
  ];

  const characters = [
    { value: 'hero', label: '🦸‍♂️ Brave Hero', icon: '🦸‍♂️' },
    { value: 'animal', label: '🐾 Cute Animal', icon: '🐾' },
    { value: 'princess', label: '👸 Princess', icon: '👸' },
    { value: 'wizard', label: '🧙‍♂️ Wizard', icon: '🧙‍♂️' },
    { value: 'robot', label: '🤖 Friendly Robot', icon: '🤖' },
    { value: 'alien', label: '👽 Space Friend', icon: '👽' }
  ];

  const languages = [
    { value: 'english', label: '🇺🇸 English' },
    { value: 'spanish', label: '🇪🇸 Español' },
    { value: 'french', label: '🇫🇷 Français' },
    { value: 'german', label: '🇩🇪 Deutsch' },
    { value: 'italian', label: '🇮🇹 Italiano' },
    { value: 'portuguese', label: '🇵🇹 Português' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Clear any existing story data before generating new one
      localStorage.removeItem('currentStory');
      
      const story = await generateStory({
        theme: formData.theme,
        character: formData.character,
        language: formData.language,
        customPrompt: formData.customPrompt
      });

      // Store the generated story data for the display page
      localStorage.setItem('currentStory', JSON.stringify(story));
      navigate('/story');
    } catch (err) {
      console.error('Story generation failed:', err);
      // Error is handled by the hook
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.theme && formData.character && formData.language;

  return (
    <div className={`min-h-screen px-4 py-8 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <div className="absolute -top-4 left-1/3 text-yellow-500 float">
              <Star className="w-6 h-6" />
            </div>
            <div className="absolute -top-6 right-1/3 text-pink-500 float" style={{ animationDelay: '1s' }}>
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="absolute -top-8 left-1/4 text-purple-500 float" style={{ animationDelay: '2s' }}>
              <Dragon className="w-7 h-7" />
            </div>
            
            <h1 className={`text-4xl sm:text-6xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Create Your
              <span className="bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent">
                {' '}Magic Story
              </span>
            </h1>
          </div>
          <p className={`text-xl font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Choose your adventure details and let AI create magic! ✨
          </p>
        </div>

        {/* Warning Display */}
        {warning && (
          <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-xl max-w-2xl mx-auto flex items-start">
            <Sparkles className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Demo Mode</p>
              <p className="text-sm">{warning}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl max-w-2xl mx-auto">
            <p className="font-medium">Story Generation Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={`backdrop-blur-sm rounded-3xl p-6 md:p-8 border-2 shadow-lg transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-purple-400' 
            : 'bg-white/80 border-purple-100'
        }`}>
          {/* Theme Selection */}
          <div className="mb-8">
            <h3 className={`text-2xl font-bold mb-4 flex items-center transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <Wand2 className="w-6 h-6 mr-2 text-yellow-500" />
              Pick Your Theme
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => handleInputChange('theme', theme.value)}
                  disabled={loading}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.theme === theme.value
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-300 text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-gray-700/60 border-purple-400 text-gray-200 hover:bg-gray-700/80 hover:border-purple-300'
                        : 'bg-white/60 border-purple-200 text-gray-700 hover:bg-white/80 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{theme.icon}</div>
                  <div className="text-sm font-medium">{theme.label.split(' ').slice(1).join(' ')}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Character Selection */}
          <div className="mb-8">
            <h3 className={`text-2xl font-bold mb-4 flex items-center transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <Star className="w-6 h-6 mr-2 text-blue-500" />
              Choose Your Character
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {characters.map((character) => (
                <button
                  key={character.value}
                  type="button"
                  onClick={() => handleInputChange('character', character.value)}
                  disabled={loading}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.character === character.value
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 border-blue-300 text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-gray-700/60 border-blue-400 text-gray-200 hover:bg-gray-700/80 hover:border-blue-300'
                        : 'bg-white/60 border-blue-200 text-gray-700 hover:bg-white/80 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{character.icon}</div>
                  <div className="text-sm font-medium">{character.label.split(' ').slice(1).join(' ')}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="mb-8">
            <h3 className={`text-2xl font-bold mb-4 flex items-center transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <Sparkles className="w-6 h-6 mr-2 text-green-500" />
              Pick Your Language
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {languages.map((language) => (
                <button
                  key={language.value}
                  type="button"
                  onClick={() => handleInputChange('language', language.value)}
                  disabled={loading}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.language === language.value
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 border-green-300 text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-gray-700/60 border-green-400 text-gray-200 hover:bg-gray-700/80 hover:border-green-300'
                        : 'bg-white/60 border-green-200 text-gray-700 hover:bg-white/80 hover:border-green-300'
                  }`}
                >
                  <div className="text-sm font-medium">{language.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="mb-8">
            <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Add Your Own Ideas (Optional)
            </h3>
            <textarea
              value={formData.customPrompt}
              onChange={(e) => handleInputChange('customPrompt', e.target.value)}
              disabled={loading}
              placeholder="Tell us more about your story... What happens in your adventure?"
              className={`w-full p-4 rounded-xl border-2 font-medium resize-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? 'bg-gray-700/60 border-purple-400 text-gray-200 placeholder-gray-400 focus:bg-gray-700/80 focus:border-purple-300'
                  : 'bg-white/60 border-purple-200 text-gray-700 placeholder-gray-500 focus:bg-white/80 focus:border-purple-400'
              }`}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="magic-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 md:px-12 rounded-full text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 glow flex items-center justify-center mx-auto min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Creating Magic...
                </>
              ) : (
                '🌟 Create My Story! 🌟'
              )}
            </button>
            <p className={`text-sm mt-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {loading 
                ? 'AI is generating your personalized story with illustrations...' 
                : 'This will generate your personalized story with AI magic!'
              }
            </p>
          </div>
        </form>
      </div>

      {/* Bolt.new Badge */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .bolt-badge {
            transition: all 0.3s ease;
          }
          @keyframes badgeIntro {
            0% { transform: rotateY(-90deg); opacity: 0; }
            100% { transform: rotateY(0deg); opacity: 1; }
          }
          .bolt-badge-intro {
            animation: badgeIntro 0.8s ease-out 1s both;
          }
          .bolt-badge-intro.animated {
            animation: none;
          }
          @keyframes badgeHover {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(22deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          .bolt-badge:hover {
            animation: badgeHover 0.6s ease-in-out;
          }
        `
      }} />
      <div className="fixed bottom-4 left-4 z-50">
        <a href="https://bolt.new/?rid=os72mi" target="_blank" rel="noopener noreferrer" 
           className="block transition-all duration-300 hover:shadow-2xl">
          <img src="https://storage.bolt.army/black_circle_360x360.png" 
               alt="Built with Bolt.new badge" 
               className="w-20 h-20 md:w-28 md:h-28 rounded-full shadow-lg bolt-badge bolt-badge-intro"
               onAnimationEnd={(e) => e.currentTarget.classList.add('animated')} />
        </a>
      </div>
    </div>
  );
};

export default StoryPromptInput;