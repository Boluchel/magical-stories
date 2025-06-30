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
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;