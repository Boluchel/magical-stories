import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, Star, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Auth = () => {
  const { isDarkMode } = useTheme();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Clear messages when switching between login/signup
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [isLogin]);

  // Redirect if already authenticated
  if (user && !authLoading) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await signInWithGoogle();
      // Redirect will happen automatically via auth state change
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || !validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const { error } = isLogin 
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(email.trim(), password);

      if (error) {
        // Handle specific error cases
        if (error.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message?.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else if (error.message?.includes('User already registered')) {
          setError('An account with this email already exists. Try signing in instead.');
          setIsLogin(true);
        } else if (error.message?.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long.');
        } else {
          setError(error.message || 'An error occurred. Please try again.');
        }
      } else if (!isLogin) {
        setSuccess('Account created! Please check your email for a confirmation link.');
        setEmail('');
        setPassword('');
      }
      // For login, redirect will happen automatically via auth state change
    } catch (error: any) {
      console.error('Email auth error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
  };

  // Show loading state while checking auth
  if (authLoading) {
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
          <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
          <h2 className={`text-2xl font-bold transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>Loading...</h2>
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
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="absolute -top-4 left-1/4 text-yellow-500 float">
              <Star className="w-6 h-6" />
            </div>
            <div className="absolute -top-6 right-1/4 text-pink-500 float" style={{ animationDelay: '1s' }}>
              <Sparkles className="w-8 h-8" />
            </div>
            
            <h1 className={`text-4xl sm:text-5xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Welcome to
              <span className="bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent">
                {' '}Magic!
              </span>
            </h1>
          </div>
          <p className={`text-lg font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {isLogin ? 'Sign in to continue your adventures!' : 'Join the magical storytelling community!'}
          </p>
        </div>

        {/* Auth Form */}
        <div className={`backdrop-blur-sm rounded-3xl p-8 border-2 shadow-lg transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-purple-400' 
            : 'bg-white/80 border-purple-100'
        }`}>
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white text-gray-700 font-medium py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{loading ? 'Please wait...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className={`absolute inset-0 flex items-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className={`w-full border-t ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 font-medium transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
              }`}>
                Or continue with email
              </span>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Success!</p>
                <p className="text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 font-medium transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700/60 border-purple-400 text-gray-200 placeholder-gray-400 focus:bg-gray-700/80 focus:border-purple-300'
                      : 'bg-white/60 border-purple-200 text-gray-700 placeholder-gray-500 focus:bg-white/80 focus:border-purple-400'
                  }`}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 font-medium transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700/60 border-purple-400 text-gray-200 placeholder-gray-400 focus:bg-gray-700/80 focus:border-purple-300'
                      : 'bg-white/60 border-purple-200 text-gray-700 placeholder-gray-500 focus:bg-white/80 focus:border-purple-400'
                  }`}
                  placeholder="Enter your password"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="text-center mt-6">
            <button
              onClick={toggleAuthMode}
              disabled={loading}
              className={`font-medium transition-colors duration-300 disabled:opacity-50 ${
                isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              {isLogin ? "Don't have an account? Sign up!" : 'Already have an account? Sign in!'}
            </button>
          </div>
        </div>

        {/* Fun Footer */}
        <div className="text-center mt-8">
          <p className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join thousands of young storytellers! ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;