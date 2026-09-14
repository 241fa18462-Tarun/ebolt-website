import React from 'react';
import { UserProfile, SearchRecord, SavedDataItem } from '../firebase';
import { EboltLogo } from './EboltLogo';
import { AiRobotAvatar } from './AiRobotAvatar';
import {
  Search,
  FileText,
  Zap,
  Star,
  Shield,
  Image as ImageIcon,
  FileCode,
  Folder,
  Settings,
  HelpCircle,
  Info,
  ChevronRight,
  Link as LinkIcon,
  Clock,
  LogOut,
  Home,
  LayoutGrid,
  User as UserIcon,
  X
} from 'lucide-react';

interface Showcase5ViewsProps {
  user: UserProfile;
  searches: SearchRecord[];
  savedItems: SavedDataItem[];
  onOpenFullView: (tab: 'home' | 'search' | 'menu' | 'profile') => void;
  onLogout: () => void;
}

export const Showcase5Views: React.FC<Showcase5ViewsProps> = ({
  user,
  onOpenFullView,
  onLogout,
}) => {
  return (
    <div className="w-full min-h-screen bg-[#DDE7F0] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Row: Panel 1 (Login) & Panel 2 (Home) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Panel 1: Login Screen (Matches Top Left in Screenshot) */}
        <div className="lg:col-span-5 rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-gradient-to-b from-[#b4d8f8] via-[#cbe5fb] to-[#e4f1fd] relative min-h-[580px] flex flex-col justify-between p-6">
          {/* Orbital rings and soft clouds */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-[320px] h-[320px] rounded-full border border-white/40 absolute -translate-y-6"></div>
            <div className="w-[480px] h-[480px] rounded-full border border-white/30 absolute -translate-y-6"></div>
            <div className="w-[640px] h-[640px] rounded-full border border-white/20 absolute -translate-y-6"></div>
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/70 to-transparent"></div>
          </div>

          {/* Logo Header */}
          <div className="relative z-10">
            <EboltLogo theme="light" size="sm" />
          </div>

          {/* Center Card */}
          <div className="relative z-10 w-full max-w-sm mx-auto rounded-3xl bg-white/95 backdrop-blur-md p-6 shadow-xl border border-white/80">
            {/* Arrow enter icon */}
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 mx-auto mb-3.5 flex items-center justify-center text-slate-800">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>

            <h3 className="text-center font-bold text-slate-900 text-lg">
              Sign in with email
            </h3>
            <p className="text-center text-[11px] text-slate-500 mt-1 mb-4 leading-relaxed">
              Make a new doc to bring your words, data, and teams together. For free
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs border border-transparent">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span className="text-slate-400">Email</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs border border-transparent">
                <div className="flex items-center gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span className="text-slate-400">Password</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>

              <button
                onClick={() => onOpenFullView('home')}
                className="w-full py-2.5 rounded-xl bg-[#181920] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
              >
                Get Started
              </button>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dotted border-slate-300"></div>
                </div>
                <span className="relative px-2 bg-white text-[10px] text-slate-400">
                  Or sign in with
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center justify-center py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
                </div>
                <div className="flex items-center justify-center py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <div className="flex items-center justify-center py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#000000"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.35-.57.65-1.07 1.71-.93 2.73 1 .08 2.01-.48 2.63-1.23z"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div></div>
        </div>

        {/* Panel 2: Home Screen (Matches Top Right in Screenshot) */}
        <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-[#F5F8FA] flex flex-col justify-between">
          {/* Top Header */}
          <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
            <EboltLogo theme="light" size="sm" />
            <div className="flex items-center gap-3">
              <div className="flex items-end gap-0.5 h-3.5 w-3.5">
                <div className="w-0.5 h-2 bg-slate-800 rounded-xs"></div>
                <div className="w-0.5 h-3 bg-slate-800 rounded-xs"></div>
                <div className="w-0.5 h-3.5 bg-slate-800 rounded-xs"></div>
              </div>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                Ravi <span className="text-[10px]">⌄</span>
              </span>
              <div className="w-7 h-7 rounded-full bg-[#1976D2] text-white flex items-center justify-center">
                <UserIcon size={14} />
              </div>
            </div>
          </div>

          {/* Body with Left Sidebar & Main Content */}
          <div className="flex-1 flex">
            {/* Left Sidebar */}
            <div className="w-36 p-3 border-r border-slate-200/80 bg-white space-y-1 text-xs">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EAF3FF] text-[#1976D2] font-semibold">
                <Home size={15} /> <span>Home</span>
              </div>
              <div onClick={() => onOpenFullView('search')} className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Search size={15} /> <span>Search</span>
              </div>
              <div onClick={() => onOpenFullView('menu')} className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer">
                <LayoutGrid size={15} /> <span>Menu</span>
              </div>
              <div onClick={() => onOpenFullView('profile')} className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer">
                <UserIcon size={15} /> <span>Profile</span>
              </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 p-5 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1">
                  Welcome back, Ravi 👋
                </h2>
                <p className="text-[11px] text-slate-500">
                  Search anything, explore, and get things done with Ebolt.
                </p>
              </div>

              {/* Search Box Card + AI Robot */}
              <div className="flex items-center gap-4 justify-between">
                <div className="flex-1 rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 mb-2.5">
                    <Search size={15} className="text-slate-400" />
                    <span className="text-xs text-slate-400 flex-1">Search anything...</span>
                    <div className="w-7 h-7 rounded-lg bg-[#1976D2] text-white flex items-center justify-center">
                      <Search size={13} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="text-slate-500 font-medium">Trending:</span>
                    {['AI', 'Technology', 'Education', 'Health', 'Business'].map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#1976D2] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Speech bubble + Robot Avatar */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="relative mb-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-[10px] text-slate-700 max-w-[140px] text-center leading-tight">
                    Hi! I&apos;m your AI assistant. Ask me anything for better results!
                  </div>
                  <AiRobotAvatar size={80} />
                </div>
              </div>

              {/* 4 Feature Cards */}
              <div className="grid grid-cols-4 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center mb-2">
                    <FileText size={15} />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Quick Access</p>
                  <p className="text-[10px] text-slate-500 leading-tight">Find what you need faster</p>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mb-2">
                    <Zap size={15} />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Smart Search</p>
                  <p className="text-[10px] text-slate-500 leading-tight">Get relevant results with AI</p>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center mb-2">
                    <Star size={15} />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Personalized</p>
                  <p className="text-[10px] text-slate-500 leading-tight">Your data, your way</p>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center mb-2">
                    <Shield size={15} />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Secure</p>
                  <p className="text-[10px] text-slate-500 leading-tight">Your information is safe</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Panel 3 (Menu), Panel 4 (Search), Panel 5 (Profile) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Panel 3: Menu (Matches Bottom Left in Screenshot) */}
        <div className="rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-[#F5F8FA] flex flex-col justify-between">
          <div className="px-4 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between">
            <EboltLogo theme="light" size="sm" />
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-0.5 h-3 w-3">
                <div className="w-0.5 h-1.5 bg-slate-800"></div>
                <div className="w-0.5 h-2.5 bg-slate-800"></div>
                <div className="w-0.5 h-3 bg-slate-800"></div>
              </div>
              <span className="text-[11px] font-semibold text-slate-800">Ravi ⌄</span>
              <div className="w-6 h-6 rounded-full bg-[#1976D2] text-white flex items-center justify-center">
                <UserIcon size={12} />
              </div>
            </div>
          </div>

          <div className="flex-1 flex min-h-[380px]">
            {/* Sidebar */}
            <div className="w-28 p-2 border-r border-slate-200/80 bg-white space-y-1 text-[11px]">
              <div onClick={() => onOpenFullView('home')} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Home size={13} /> <span>Home</span>
              </div>
              <div onClick={() => onOpenFullView('search')} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Search size={13} /> <span>Search</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#EAF3FF] text-[#1976D2] font-semibold">
                <LayoutGrid size={13} /> <span>Menu</span>
              </div>
              <div onClick={() => onOpenFullView('profile')} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">
                <UserIcon size={13} /> <span>Profile</span>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="flex-1 p-4">
              <h3 className="text-base font-bold text-slate-900 mb-3">Menu</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center mb-1.5">
                    <FileText size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">Documents</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mb-1.5">
                    <ImageIcon size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">Images</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center mb-1.5">
                    <FileCode size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">Notes</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center mb-1.5">
                    <Folder size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">Files</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center mb-1.5">
                    <Settings size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">Settings</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center mb-1.5">
                    <HelpCircle size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">Help</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center mb-1.5">
                    <Info size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">About</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center justify-between text-[11px]">
            <EboltLogo theme="light" size="sm" />
            <div className="flex items-center gap-3 text-slate-600">
              <span onClick={() => onOpenFullView('home')} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"><Home size={12} /> Home</span>
              <span onClick={() => onOpenFullView('search')} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"><Search size={12} /> Search</span>
              <span className="text-[#1976D2] font-semibold flex items-center gap-1"><LayoutGrid size={12} /> Menu</span>
              <span onClick={() => onOpenFullView('profile')} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"><UserIcon size={12} /> Profile</span>
            </div>
          </div>
        </div>

        {/* Panel 4: Search Results (Matches Bottom Middle in Screenshot) */}
        <div className="rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-[#F5F8FA] flex flex-col justify-between">
          <div className="px-4 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between">
            <EboltLogo theme="light" size="sm" />
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-0.5 h-3 w-3">
                <div className="w-0.5 h-1.5 bg-slate-800"></div>
                <div className="w-0.5 h-2.5 bg-slate-800"></div>
                <div className="w-0.5 h-3 bg-slate-800"></div>
              </div>
              <span className="text-[11px] font-semibold text-slate-800">Ravi ⌄</span>
              <div className="w-6 h-6 rounded-full bg-[#1976D2] text-white flex items-center justify-center">
                <UserIcon size={12} />
              </div>
            </div>
          </div>

          <div className="flex-1 flex min-h-[380px]">
            {/* Sidebar */}
            <div className="w-28 p-2 border-r border-slate-200/80 bg-white space-y-1 text-[11px]">
              <div onClick={() => onOpenFullView('home')} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Home size={13} /> <span>Home</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#EAF3FF] text-[#1976D2] font-semibold">
                <Search size={13} /> <span>Search</span>
              </div>
              <div onClick={() => onOpenFullView('menu')} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">
                <LayoutGrid size={13} /> <span>Menu</span>
              </div>
              <div onClick={() => onOpenFullView('profile')} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">
                <UserIcon size={13} /> <span>Profile</span>
              </div>
            </div>

            {/* Search Results Content */}
            <div className="flex-1 p-3 space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900">Search Results</h3>

              {/* Search Bar */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <Search size={13} className="text-slate-400" />
                <span className="text-xs text-slate-800 font-medium flex-1">machine learning</span>
                <X size={12} className="text-slate-400" />
                <div className="w-6 h-6 rounded-lg bg-[#1976D2] text-white flex items-center justify-center">
                  <Search size={11} />
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-1.5">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 leading-tight">Introduction to Machine Learning</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">Machine learning is a branch of AI that allows computers to learn from data...</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 leading-tight">Machine Learning Basics</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">Learn the core concepts, algorithms and real-world applications of machine learning...</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                      <LinkIcon size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 leading-tight">ML Tutorial</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">A step-by-step guide to get started with machine learning using Python...</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center justify-between text-[11px]">
            <EboltLogo theme="light" size="sm" />
            <div className="flex items-center gap-3 text-slate-600">
              <span onClick={() => onOpenFullView('home')} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"><Home size={12} /> Home</span>
              <span className="text-[#1976D2] font-semibold flex items-center gap-1"><Search size={12} /> Search</span>
              <span onClick={() => onOpenFullView('menu')} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"><LayoutGrid size={12} /> Menu</span>
              <span onClick={() => onOpenFullView('profile')} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"><UserIcon size={12} /> Profile</span>
            </div>
          </div>
        </div>

        {/* Panel 5: Profile (Matches Bottom Right in Screenshot) */}
        <div className="rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-[#F5F8FA] flex flex-col justify-between">
          <div className="px-4 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between">
            <EboltLogo theme="light" size="sm" />
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-0.5 h-3 w-3">
                <div className="w-0.5 h-1.5 bg-slate-800"></div>
                <div className="w-0.5 h-2.5 bg-slate-800"></div>
                <div className="w-0.5 h-3 bg-slate-800"></div>
              </div>
              <span className="text-[11px] font-semibold text-slate-800">Ravi ⌄</span>
              <div className="w-6 h-6 rounded-full bg-[#1976D2] text-white flex items-center justify-center">
                <UserIcon size={12} />
              </div>
            </div>
          </div>

          <div className="flex-1 flex min-h-[380px]">
            {/* Sidebar */}
            <div className="w-28 p-2 border-r border-slate-200/80 bg-white space-y-1 text-[11px]">
              <div onClick={() => onOpenFullView('home')} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Home size={13} /> <span>Home</span>
              </div>
              <div onClick={() => onOpenFullView('search')} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Search size={13} /> <span>Search</span>
              </div>
              <div onClick={() => onOpenFullView('menu')} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">
                <LayoutGrid size={13} /> <span>Menu</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#EAF3FF] text-[#1976D2] font-semibold">
                <UserIcon size={13} /> <span>Profile</span>
              </div>
            </div>

            {/* Profile Content */}
            <div className="flex-1 p-4">
              <h3 className="text-base font-bold text-slate-900 mb-3">My Profile</h3>

              <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-bold text-lg">
                    R
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Ravi</h4>
                    <p className="text-[11px] text-slate-500 font-mono">ravi@gmail.com</p>
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer">
                    <span className="flex items-center gap-2"><Settings size={14} className="text-slate-500" /> Account Settings</span>
                    <ChevronRight size={13} className="text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer">
                    <span className="flex items-center gap-2"><Clock size={14} className="text-slate-500" /> Activity Log</span>
                    <ChevronRight size={13} className="text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer">
                    <span className="flex items-center gap-2"><HelpCircle size={14} className="text-slate-500" /> Help & Support</span>
                    <ChevronRight size={13} className="text-slate-400" />
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full py-2 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center justify-between text-[11px]">
            <EboltLogo theme="light" size="sm" />
            <div className="flex items-center gap-3 text-slate-600">
              <span onClick={() => onOpenFullView('home')} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"><Home size={12} /> Home</span>
              <span onClick={() => onOpenFullView('search')} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"><Search size={12} /> Search</span>
              <span onClick={() => onOpenFullView('menu')} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"><LayoutGrid size={12} /> Menu</span>
              <span className="text-[#1976D2] font-semibold flex items-center gap-1"><UserIcon size={12} /> Profile</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
