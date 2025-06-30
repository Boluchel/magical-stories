import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Homepage from './pages/Homepage';
import StoryPromptInput from './pages/StoryPromptInput';
import StoryDisplay from './pages/StoryDisplay';
import About from './pages/About';
import Auth from './pages/Auth';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen transition-colors duration-300">
            <Navigation />
            <main className="pt-[68px]">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/create" element={<StoryPromptInput />} />
                <Route path="/story" element={<StoryDisplay />} />
                <Route path="/about" element={<About />} />
                <Route path="/auth" element={<Auth />} />
              </Routes>
            </main>
            
            {/* Bolt.new Badge - Global */}
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
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;