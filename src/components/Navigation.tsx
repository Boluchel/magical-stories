import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PenTool, BookOpen, Heart, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/create', icon: PenTool, label: 'Create' },
    { path: '/story', icon: BookOpen, label: 'Story' },
    { path: '/saved', icon: Heart, label: 'Saved' },
    { path: '/about', icon: Info, label: 'About' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 backdrop-blur-sm shadow-lg z-50 border-b-4 border-yellow-400 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900/90' 
        : 'bg-white/90'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className={`font-bold text-xl hidden sm:block transition-colors duration-300 ${
              isDarkMode ? 'text-purple-300' : 'text-purple-600'
            }`}>
              Magical Stories
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1 sm:space-x-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === path
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : isDarkMode
                        ? 'text-purple-300 hover:bg-purple-800/50 hover:scale-105'
                        : 'text-purple-600 hover:bg-purple-100 hover:scale-105'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              ))}
            </div>
            
            {/* Theme Toggle */}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;