import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PenTool, BookOpen, Heart, Info, Sparkles, Menu, X, User, LogOut, Crown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { user, signOut } = useAuth();
  const { isSubscribed } = useSubscription();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/create', icon: PenTool, label: 'Create' },
    { path: '/story', icon: BookOpen, label: 'Story' },
    { path: '/saved', icon: Heart, label: 'Saved' },
    { path: '/subscription', icon: Crown, label: 'Premium' },
    { path: '/about', icon: Info, label: 'About' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
            <span className={`font-bold text-lg sm:text-xl transition-colors duration-300 ${
              isDarkMode ? 'text-purple-300' : 'text-purple-600'
            }`}>
              <span className="hidden sm:inline">Magical Stories</span>
              <span className="sm:hidden">Magic</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 relative ${
                    location.pathname === path
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : isDarkMode
                        ? 'text-purple-300 hover:bg-purple-800/50 hover:scale-105'
                        : 'text-purple-600 hover:bg-purple-100 hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{label}</span>
                  {path === '/subscription' && isSubscribed && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
            
            {/* User Menu & Theme Toggle */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    isDarkMode ? 'bg-purple-800/50' : 'bg-purple-100'
                  }`}>
                    <User className={`w-4 h-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-purple-300' : 'text-purple-600'
                    }`}>
                      {user.email?.split('@')[0]}
                    </span>
                    {isSubscribed && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-purple-300 hover:bg-purple-800/50' 
                        : 'text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-purple-300 hover:bg-purple-800/50' 
                  : 'text-purple-600 hover:bg-purple-100'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t-2 border-yellow-400 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 relative ${
                    location.pathname === path
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : isDarkMode
                        ? 'text-purple-300 hover:bg-purple-800/50'
                        : 'text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                  {path === '/subscription' && isSubscribed && (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full ml-auto"></div>
                  )}
                </Link>
              ))}
              
              {/* Mobile User Section */}
              <div className="pt-2 border-t border-gray-300">
                {user ? (
                  <div className="space-y-2">
                    <div className={`flex items-center space-x-3 px-3 py-3 rounded-lg ${
                      isDarkMode ? 'bg-purple-800/50' : 'bg-purple-100'
                    }`}>
                      <User className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                      <span className={`font-medium ${
                        isDarkMode ? 'text-purple-300' : 'text-purple-600'
                      }`}>
                        {user.email?.split('@')[0]}
                      </span>
                      {isSubscribed && (
                        <Crown className="w-5 h-5 text-yellow-500 ml-auto" />
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-purple-300 hover:bg-purple-800/50' 
                          : 'text-purple-600 hover:bg-purple-100'
                      }`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-medium"
                  >
                    <User className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;