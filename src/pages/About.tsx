import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Heart, Star, Zap, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const About = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen px-4 py-8 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl sm:text-6xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            About Our
            <span className="bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent">
              {' '}Magic
            </span>
          </h1>
          <p className={`text-xl font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Bringing storytelling to life with AI and imagination! ✨
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* App Description */}
          <div className={`backdrop-blur-sm rounded-3xl p-8 border-2 shadow-lg transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-purple-400' 
              : 'bg-white/80 border-purple-100'
          }`}>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full mr-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className={`text-3xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Magical Story Creator</h2>
            </div>
            
            <p className={`text-lg leading-relaxed mb-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Our app is designed to spark imagination and creativity in children of all ages. Using advanced AI technology, we create personalized stories that can be told in multiple languages, making storytelling accessible and fun for families around the world.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className={`rounded-2xl p-6 border-2 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-purple-900/50 border-purple-400' 
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <div className="flex items-center mb-3">
                  <Zap className="w-6 h-6 text-yellow-500 mr-2" />
                  <h3 className={`text-xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>AI-Powered</h3>
                </div>
                <p className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Stories generated using cutting-edge AI technology for unique adventures every time.
                </p>
              </div>
              
              <div className={`rounded-2xl p-6 border-2 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-blue-900/50 border-blue-400' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center mb-3">
                  <Globe className="w-6 h-6 text-blue-500 mr-2" />
                  <h3 className={`text-xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>Multilingual</h3>
                </div>
                <p className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Stories available in multiple languages to connect families across cultures.
                </p>
              </div>
            </div>
          </div>

          {/* Hackathon Context */}
          <div className={`backdrop-blur-sm rounded-3xl p-8 border-2 shadow-lg transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-green-400' 
              : 'bg-white/80 border-green-100'
          }`}>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full mr-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className={`text-3xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Hackathon Project</h2>
            </div>
            
            <p className={`text-lg leading-relaxed mb-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              This app was created as part of an innovative hackathon focused on leveraging AI to create meaningful experiences for children and families. Our goal was to combine storytelling, technology, and creativity in a way that's both educational and entertaining.
            </p>
            
            <div className={`rounded-2xl p-6 border-2 transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-purple-900/50 border-purple-400' 
                : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200'
            }`}>
              <div className="flex items-center mb-3">
                <Globe className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`font-bold text-lg transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>Built with Bolt.new</span>
              </div>
              <p className={`transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Powered by Bolt.new's revolutionary AI development platform, enabling rapid prototyping and deployment of creative applications.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className={`backdrop-blur-sm rounded-3xl p-8 border-2 shadow-lg transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-yellow-400' 
              : 'bg-white/80 border-yellow-100'
          }`}>
            <h2 className={`text-3xl font-bold mb-6 text-center transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              What Makes Us Special
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>Personalized Stories</h3>
                <p className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Every story is unique and tailored to your chosen themes and characters.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>Multiple Languages</h3>
                <p className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Create and listen to stories in your family's preferred language.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>Kid-Friendly</h3>
                <p className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Designed with children in mind - safe, colorful, and easy to use.</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className={`backdrop-blur-sm rounded-3xl p-8 border-2 shadow-lg text-center transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-pink-400' 
              : 'bg-white/80 border-pink-100'
          }`}>
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-full mr-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className={`text-3xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Get in Touch</h2>
            </div>
            
            <p className={`text-lg mb-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              We'd love to hear from you! Share your feedback, story ideas, or just say hello.
            </p>
            
            <div className={`rounded-2xl p-6 border-2 inline-block transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-purple-900/50 border-purple-400' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <p className={`font-bold text-lg mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Contact Email</p>
              <a 
                href="mailto:hello@magicalstories.app" 
                className="text-blue-600 hover:text-blue-700 text-lg underline transition-colors duration-300"
              >
                hello@magicalstories.app
              </a>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link
              to="/create"
              className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Creating Stories! 🌟
            </Link>
            <p className={`text-sm mt-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Join thousands of young storytellers on magical adventures!
            </p>
          </div>
        </div>
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

export default About;