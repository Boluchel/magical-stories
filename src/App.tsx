import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import Homepage from './pages/Homepage';
import StoryPromptInput from './pages/StoryPromptInput';
import StoryDisplay from './pages/StoryDisplay';
import SavedStories from './pages/SavedStories';
import About from './pages/About';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-300">
          <Navigation />
          <main className="pt-20 pb-8">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/create" element={<StoryPromptInput />} />
              <Route path="/story" element={<StoryDisplay />} />
              <Route path="/saved" element={<SavedStories />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;