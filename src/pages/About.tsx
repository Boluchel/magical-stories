import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Heart, Star, Zap, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-800 mb-4">
            About Our
            <span className="bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent">
              {' '}Magic
            </span>
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Bringing storytelling to life with AI and imagination! ✨
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* App Description */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-purple-100 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full mr-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Magical Story Creator</h2>
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Our app is designed to spark imagination and creativity in children of all ages. Using advanced AI technology, we create personalized stories that can be told in multiple languages, making storytelling accessible and fun for families around the world.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                <div className="flex items-center mb-3">
                  <Zap className="w-6 h-6 text-yellow-500 mr-2" />
                  <h3 className="text-xl font-bold text-gray-800">AI-Powered</h3>
                </div>
                <p className="text-gray-600">
                  Stories generated using cutting-edge AI technology for unique adventures every time.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center mb-3">
                  <Globe className="w-6 h-6 text-blue-500 mr-2" />
                  <h3 className="text-xl font-bold text-gray-800">Multilingual</h3>
                </div>
                <p className="text-gray-600">
                  Stories available in multiple languages to connect families across cultures.
                </p>
              </div>
            </div>
          </div>

          {/* Hackathon Context */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-green-100 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full mr-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Hackathon Project</h2>
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              This app was created as part of an innovative hackathon focused on leveraging AI to create meaningful experiences for children and families. Our goal was to combine storytelling, technology, and creativity in a way that's both educational and entertaining.
            </p>
            
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center mb-3">
                <Globe className="w-6 h-6 text-purple-600 mr-2" />
                <span className="text-gray-800 font-bold text-lg">Built with Bolt.new</span>
              </div>
              <p className="text-gray-700">
                Powered by Bolt.new's revolutionary AI development platform, enabling rapid prototyping and deployment of creative applications.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-yellow-100 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              What Makes Us Special
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Personalized Stories</h3>
                <p className="text-gray-600">Every story is unique and tailored to your chosen themes and characters.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Multiple Languages</h3>
                <p className="text-gray-600">Create and listen to stories in your family's preferred language.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Kid-Friendly</h3>
                <p className="text-gray-600">Designed with children in mind - safe, colorful, and easy to use.</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-pink-100 shadow-lg text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-full mr-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Get in Touch</h2>
            </div>
            
            <p className="text-gray-700 text-lg mb-6">
              We'd love to hear from you! Share your feedback, story ideas, or just say hello.
            </p>
            
            <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200 inline-block">
              <p className="text-gray-800 font-bold text-lg mb-2">Contact Email</p>
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
            <p className="text-gray-600 text-sm mt-4">
              Join thousands of young storytellers on magical adventures!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;