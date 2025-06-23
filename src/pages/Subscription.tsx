import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Check, Star, Zap, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const Subscription = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    isSubscribed, 
    packages, 
    customerInfo, 
    loading, 
    error, 
    purchasePackage, 
    restorePurchases 
  } = useSubscription();
  
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

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
            Please log in to manage your subscription!
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

  const handlePurchase = async (pkg: any) => {
    try {
      setPurchaseLoading(pkg.identifier);
      await purchasePackage(pkg);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  const premiumFeatures = [
    { icon: '🎨', title: 'AI-Generated Images', description: 'Beautiful custom illustrations for every story' },
    { icon: '🎵', title: 'Audio Narration', description: 'Professional voice narration in multiple languages' },
    { icon: '📚', title: 'Unlimited Stories', description: 'Create as many magical stories as you want' },
    { icon: '💾', title: 'Save & Share', description: 'Save your favorite stories and share with friends' },
    { icon: '🌍', title: 'All Languages', description: 'Access to all supported languages and voices' },
    { icon: '⚡', title: 'Priority Generation', description: 'Faster story and audio generation' },
  ];

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
            to="/"
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-700/60 border border-purple-400 text-gray-200 hover:bg-gray-700/80'
                : 'bg-white/60 border border-purple-200 text-gray-700 hover:bg-white/80'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <div className="absolute -top-4 left-1/3 text-yellow-500 float">
              <Star className="w-6 h-6" />
            </div>
            <div className="absolute -top-6 right-1/3 text-pink-500 float" style={{ animationDelay: '1s' }}>
              <Crown className="w-8 h-8" />
            </div>
            
            <h1 className={`text-4xl sm:text-6xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Unlock
              <span className="bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent">
                {' '}Premium Magic
              </span>
            </h1>
          </div>
          <p className={`text-xl font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Get unlimited access to all magical story features! ✨
          </p>
        </div>

        {/* Current Status */}
        {isSubscribed && (
          <div className={`backdrop-blur-sm rounded-3xl p-8 border-2 shadow-lg mb-8 transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-green-900/50 border-green-400' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="text-center">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>You're a Premium Member!</h2>
              <p className={`text-lg transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Enjoy unlimited access to all magical story features
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl max-w-2xl mx-auto">
            <p className="font-medium">Subscription Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !packages.length ? (
          <div className="flex items-center justify-center py-16">
            <div className={`text-center backdrop-blur-sm rounded-3xl p-12 border-2 shadow-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/80 border-purple-400' 
                : 'bg-white/80 border-purple-100'
            }`}>
              <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
              <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Loading Subscription Options...</h3>
            </div>
          </div>
        ) : (
          <>
            {/* Premium Features */}
            <div className={`backdrop-blur-sm rounded-3xl p-8 border-2 shadow-lg mb-8 transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/80 border-purple-400' 
                : 'bg-white/80 border-purple-100'
            }`}>
              <h2 className={`text-3xl font-bold mb-8 text-center transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>
                Premium Features
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border-2 transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-purple-900/50 border-purple-400' 
                        : 'bg-purple-50 border-purple-200'
                    }`}
                  >
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Plans */}
            {packages.length > 0 && !isSubscribed && (
              <div className={`backdrop-blur-sm rounded-3xl p-8 border-2 shadow-lg mb-8 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-purple-400' 
                  : 'bg-white/80 border-purple-100'
              }`}>
                <h2 className={`text-3xl font-bold mb-8 text-center transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  Choose Your Plan
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.identifier}
                      className={`relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-gray-700/60 border-yellow-400' 
                          : 'bg-white/80 border-yellow-200'
                      }`}
                    >
                      {/* Popular Badge */}
                      {pkg.packageType === 'MONTHLY' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}>
                          {pkg.product.title}
                        </h3>
                        <p className={`text-sm mb-4 transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {pkg.product.description}
                        </p>
                        
                        <div className="mb-6">
                          <span className={`text-4xl font-bold transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-800'
                          }`}>
                            {pkg.product.priceString}
                          </span>
                          <span className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            /{pkg.packageType === 'MONTHLY' ? 'month' : 'year'}
                          </span>
                        </div>

                        <button
                          onClick={() => handlePurchase(pkg)}
                          disabled={purchaseLoading === pkg.identifier}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
                        >
                          {purchaseLoading === pkg.identifier ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-2" />
                              Subscribe Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restore Purchases */}
            <div className="text-center">
              <button
                onClick={handleRestore}
                disabled={loading}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700/60 border border-purple-400 text-gray-200 hover:bg-gray-700/80'
                    : 'bg-white/60 border border-purple-200 text-gray-700 hover:bg-white/80'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restore Purchases</span>
              </button>
              <p className={`text-sm mt-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Already have a subscription? Restore your purchases here.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Subscription;