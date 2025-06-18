import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 ${
        isDarkMode
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 focus:ring-purple-300'
          : 'bg-gradient-to-r from-yellow-400 to-orange-400 focus:ring-yellow-300'
      }`}
      aria-label="Toggle dark mode"
    >
      <div
        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${
          isDarkMode ? 'translate-x-8' : 'translate-x-1'
        }`}
      >
        {isDarkMode ? (
          <Moon className="w-4 h-4 text-purple-600" />
        ) : (
          <Sun className="w-4 h-4 text-orange-500" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;