import React, { useState } from 'react';
import { UserProfile, SearchRecord, SavedDataItem } from '../firebase';
import { AiRobotAvatar } from './AiRobotAvatar';
import { AudioTranscriberModal } from './AudioTranscriberModal';
import {
  Search,
  FileText,
  Zap,
  Star,
  Shield,
  ArrowRight,
  Mic,
  Bot
} from 'lucide-react';

interface HomeViewProps {
  user: UserProfile;
  searches: SearchRecord[];
  savedItems: SavedDataItem[];
  onNavigate: (tab: 'home' | 'chat' | 'search' | 'menu' | 'profile') => void;
  onSelectSearchItem: (search: SearchRecord) => void;
  onQuickSearch?: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
  onQuickSearch,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showTranscriber, setShowTranscriber] = useState(false);

  const trendingTags = ['AI', 'Technology', 'Education', 'Health', 'Business'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    if (onQuickSearch) {
      onQuickSearch(searchInput.trim());
    } else {
      onNavigate('search');
    }
  };

  const handleTagClick = (tag: string) => {
    if (onQuickSearch) {
      onQuickSearch(tag);
    } else {
      onNavigate('search');
    }
  };

  return (
    <div id="ebolt-home-view" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Audio Transcriber Modal with gemini-3.5-transcribe */}
      <AudioTranscriberModal
        isOpen={showTranscriber}
        onClose={() => setShowTranscriber(false)}
        userId={user.uid}
        onInsertText={(text) => setSearchInput(text)}
      />

      {/* Welcome Heading matching Screenshot */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Welcome back, {user.displayName || 'Ravi'}</span>
          <span className="text-2xl sm:text-3xl">👋</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Search anything, chat with Gemini AI, or dictate with voice.
        </p>
      </div>

      {/* Main Search Box + AI Assistant Robot Section matching Screenshot */}
      <div className="relative mb-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
        
        {/* Left: Large Search Card */}
        <div className="w-full lg:flex-1 rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={19} className="text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search anything or dictate with voice..."
                className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />

              {/* Microphone Audio Dictation Button (gemini-3.5-transcribe) */}
              <button
                type="button"
                onClick={() => setShowTranscriber(true)}
                title="Dictate with voice (gemini-3.5-transcribe)"
                className="p-2 rounded-xl text-slate-500 hover:text-[#1976D2] hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Mic size={18} />
              </button>

              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-[#1976D2] hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer flex-shrink-0"
                title="Search with AI"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Trending tags row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-600 font-medium mr-1">Trending:</span>
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1 rounded-full bg-[#EAF3FF] hover:bg-[#D9EAFE] text-[#1976D2] font-medium transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Right: AI Assistant Robot Character with Speech Bubble */}
        <div
          id="ebolt-home-ai-bot"
          onClick={() => onNavigate('chat')}
          className="relative flex flex-col items-center flex-shrink-0 cursor-pointer group select-none transition-transform active:scale-95"
          title="Tap to chat with Gemini AI"
        >
          {/* Speech Bubble */}
          <div className="relative mb-3 px-4 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-xs text-slate-800 font-medium max-w-[220px] text-center leading-relaxed group-hover:border-[#1976D2] group-hover:shadow-md transition-all">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#1976D2] mb-0.5">
              <Bot size={13} />
              <span>Tap to Open Gemini AI</span>
            </div>
            Hi! I&apos;m your AI assistant. Ask me anything or chat with Gemini!
            {/* Pointer notch pointing down to robot */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200/90 transform rotate-45 group-hover:border-[#1976D2] transition-colors"></div>
          </div>

          {/* Cute 3D AI Robot Avatar with interactive tap badge */}
          <div className="relative group-hover:scale-108 transition-all duration-300">
            <AiRobotAvatar size={115} />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#1976D2] text-white text-[10px] font-bold shadow-xs flex items-center gap-1 whitespace-nowrap animate-bounce">
              <span>Tap AI</span>
            </span>
          </div>
        </div>

      </div>

      {/* 4 Feature Cards Row matching Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Quick Access */}
        <div
          onClick={() => onNavigate('menu')}
          className="rounded-3xl bg-white border border-slate-200/90 hover:border-blue-300 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <FileText size={22} className="fill-[#1976D2]/20" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Quick Access
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Find what you need faster
          </p>
        </div>

        {/* Card 2: Smart Search */}
        <div
          onClick={() => onNavigate('search')}
          className="rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Zap size={22} className="fill-[#10B981]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Smart Search
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Get relevant results with AI
          </p>
        </div>

        {/* Card 3: Personalized */}
        <div
          onClick={() => onNavigate('profile')}
          className="rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Star size={22} className="fill-[#8B5CF6]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Personalized
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your data, your way
          </p>
        </div>

        {/* Card 4: Secure */}
        <div
          onClick={() => onNavigate('profile')}
          className="rounded-3xl bg-white border border-slate-200/90 hover:border-amber-300 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Shield size={22} className="fill-[#F59E0B]/20" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Secure
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your information is safe
          </p>
        </div>

      </div>

    </div>
  );
};
