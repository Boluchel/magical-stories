import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Share2, ArrowLeft, Loader2, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import AudioPlayer from '../components/AudioPlayer';

interface Story {
  id: string;
  title: string;
  theme: string;
  character: string;
  language: string;
  customPrompt: string;
  storyText: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: string;
}

const StoryDisplay = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);

  const {
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    generateAndPlayAudio,
    loading: audioLoading,
    error: audioError,
    cleanup,
  } = useAudioPlayer();

  useEffect(() => {
    const currentStory = localStorage.getItem('currentStory');
    if (currentStory) {
      try {
        const parsedStory = JSON.parse(currentStory);
        setStory(parsedStory);
      } catch (error) {
        console.error('Error parsing story data:', error);
        navigate('/create');
      }
    } else {
      navigate('/create');
    }
  }, [navigate]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleShare = () => {
    if (navigator.share && story) {
      navigator.share({
        title: story.title,
        text: `Check out this magical story: ${story.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Story link copied to clipboard! 🌟');
      }).catch(() => {
        alert('Story shared! 🌟');
      });
    }
  };

  const handleDownloadStory = () => {
    if (!story) return;
    
    const storyContent = `${story.title}\n\n${story.storyText}\n\nTheme: ${story.theme}\nCharacter: ${story.character}\nLanguage: ${story.language}${story.customPrompt ? `\nCustom Ideas: ${story.customPrompt}` : ''}`;
    
    const blob = new Blob([storyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateAudio = async () => {
    if (!story) return;
    
    try {
      await generateAndPlayAudio(story.storyText, story.language);
    } catch (error) {
      console.error('Failed to generate audio:', error);
    }
  };

  if (!story) {
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
          <h2 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>Loading Your Story...</h2>
        </div>
      </div>
    );
  }

  // Check if we have audio available (either generated or placeholder)
  const hasAudio = story.audioUrl === 'audio_generated' || duration > 0;

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
            to="/create"
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-700/60 border border-purple-400 text-gray-200 hover:bg-gray-700/80'
                : 'bg-white/60 border border-purple-200 text-gray-700 hover:bg-white/80'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Create Another Story</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl sm:text-5xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {story.title}
          </h1>
          <div className={`backdrop-blur-sm rounded-full px-6 py-2 inline-block border-2 shadow-md transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-purple-400 text-gray-200' 
              : 'bg-white/80 border-purple-200 text-gray-700'
          }`}>
            <span className="font-medium">
              Theme: {story.theme} • Character: {story.character} • Language: {story.language}
            </span>
          </div>
        </div>

        {/* Story Content */}
        <div className={`backdrop-blur-sm rounded-3xl p-8 border-2 shadow-lg mb-8 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-purple-400' 
            : 'bg-white/80 border-purple-100'
        }`}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Story Text */}
            <div className="space-y-6">
              <div className={`text-lg leading-relaxed space-y-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {story.storyText.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Enhanced Audio Player */}
              <AudioPlayer
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                progress={progress}
                volume={volume}
                isMuted={isMuted}
                loading={audioLoading}
                error={audioError}
                onPlay={play}
                onPause={pause}
                onStop={stop}
                onSeek={seek}
                onVolumeChange={setVolume}
                onToggleMute={toggleMute}
                onGenerateAudio={handleGenerateAudio}
                hasAudio={hasAudio}
              />
            </div>

            {/* Story Image */}
            <div className="space-y-6">
              <div className={`rounded-2xl p-4 border-2 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-purple-900/50 border-purple-400' 
                  : 'bg-purple-50 border-purple-200'
              }`}>
                {story.imageUrl ? (
                  <img
                    src={story.imageUrl}
                    alt="AI-generated story illustration"
                    className="w-full h-64 sm:h-80 object-cover rounded-xl"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/3568518/pexels-photo-3568518.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop";
                    }}
                  />
                ) : (
                  <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">🎨</div>
                      <p className="font-medium">AI Illustration</p>
                      <p className="text-sm opacity-80">Generated for your story</p>
                    </div>
                  </div>
                )}
                <p className={`text-sm mt-2 text-center transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  AI-Generated Story Illustration
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleShare}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gray-700/60 border-2 border-blue-400 text-gray-200 hover:bg-gray-700/80'
                        : 'bg-white/60 border-2 border-blue-200 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={handleDownloadStory}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gray-700/60 border-2 border-green-400 text-gray-200 hover:bg-gray-700/80'
                        : 'bg-white/60 border-2 border-green-200 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>

                <Link
                  to="/create"
                  className="w-full block bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Create New Story
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Story Details */}
        {story.customPrompt && (
          <div className={`backdrop-blur-sm rounded-2xl p-6 border-2 shadow-lg transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-purple-400' 
              : 'bg-white/80 border-purple-100'
          }`}>
            <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>Your Custom Ideas</h3>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              "{story.customPrompt}"
            </p>
          </div>
        )}
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

export default StoryDisplay;