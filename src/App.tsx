import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Navigation from './components/Navigation';
import Homepage from './pages/Homepage';
import StoryPromptInput from './pages/StoryPromptInput';
import StoryDisplay from './pages/StoryDisplay';
import SavedStories from './pages/SavedStories';
import About from './pages/About';
import Auth from './pages/Auth';
import Subscription from './pages/Subscription';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
            <div className="min-h-screen transition-colors duration-300">
              <Navigation />
              <main className="pt-[68px]">
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/create" element={<StoryPromptInput />} />
                  <Route path="/story" element={<StoryDisplay />} />
                  <Route path="/saved" element={<SavedStories />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/subscription" element={<Subscription />} />
                </Routes>
              </main>
            </div>
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;