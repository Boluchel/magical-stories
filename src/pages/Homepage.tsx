import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Zap, Globe, Wand2 } from 'lucide-react';

const Homepage = () => {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Floating decorative elements */}
          <div className="relative">
            <div className="absolute -top-4 left-1/4 text-yellow-500 float">
              <Star className="w-8 h-8" />
            </div>
            <div className="absolute -top-8 right-1/4 text-pink-500 float" style={{ animationDelay: '1s' }}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute -top-6 left-1/6 text-blue-500 float" style={{ animationDelay: '2s' }}>
              <Zap className="w-7 h-7" />
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Magical Story
              </span>
              <br />
              <span className="text-gray-700">Creator</span>
            </h1>
          </div>
          
          <p className="text-xl sm:text-2xl text-gray-700 font-medium mb-8">
            Create Amazing Stories in Any Language! ✨
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/create"
              className="magic-button text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 glow"
            >
              🌟 Start Your Story 🌟
            </Link>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-purple-200 shadow-md">
              <span className="text-gray-700 font-semibold flex items-center">
                <Globe className="w-5 h-5 mr-2 text-purple-600" />
                Built with Bolt.new
              </span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border-2 border-purple-100 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Magic Themes</h3>
            <p className="text-gray-600">Choose from dragons, space adventures, fairy tales, and more!</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border-2 border-blue-100 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Any Language</h3>
            <p className="text-gray-600">Create stories in English, Spanish, French, and many more!</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border-2 border-yellow-100 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">AI Narration</h3>
            <p className="text-gray-600">Listen to your stories with amazing AI voice narration!</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border-2 border-purple-100 shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
              Ready for a Magical Adventure?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of young storytellers creating amazing adventures!
            </p>
            <Link
              to="/create"
              className="inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Create Your First Story! 🚀
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;