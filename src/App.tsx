import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Homepage from './pages/Homepage';
import StoryPromptInput from './pages/StoryPromptInput';
import StoryDisplay from './pages/StoryDisplay';
import SavedStories from './pages/SavedStories';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
  );
}

export default App;