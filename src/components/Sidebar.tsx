import React from 'react';
import { Home, Search, LayoutGrid, User, Bot } from 'lucide-react';
import { AnimatedBackground } from '@/components/core/animated-background';

export type NavTab = 'home' | 'chat' | 'search' | 'menu' | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onChangeTab }) => {
  // Desktop sidebar options: Home, Search, Manu, Profile
  // Changed "Menu & Files" to "Manu" per user request
  const desktopNavItems: { id: NavTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'menu', label: 'Manu', icon: LayoutGrid },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Mobile bottom bar items: Shift options to the bottom side on mobile view
  const mobileNavItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    isSpecial?: boolean;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'chat', label: 'Gemini AI', icon: Bot, isSpecial: true },
    { id: 'menu', label: 'Manu', icon: LayoutGrid },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* 1. Desktop Left Sidebar (hidden on mobile) - Decreased size per user request & image */}
      <aside
        id="ebolt-main-sidebar"
        className="hidden md:flex w-36 flex-shrink-0 px-2 py-4 border-r border-slate-200/80 bg-white select-none transition-all flex-col justify-between"
      >
        <nav className="space-y-1">
          <AnimatedBackground
            defaultValue={activeTab}
            value={activeTab}
            className="rounded-xl bg-[#EAF3FF] shadow-2xs border border-blue-100/80"
            transition={{
              type: 'spring',
              bounce: 0.2,
              duration: 0.3,
            }}
            enableHover
            onValueChange={(id) => {
              if (id) onChangeTab(id as NavTab);
            }}
          >
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-id={item.id}
                  type="button"
                  onClick={() => onChangeTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-[#1976D2] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon
                    size={19}
                    className={isActive ? 'text-[#1976D2]' : 'text-slate-500'}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </AnimatedBackground>
        </nav>
      </aside>

      {/* 2. Mobile Bottom Navigation Bar (Visible only on mobile devices) */}
      <nav
        id="ebolt-mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(15,23,42,0.08)] px-2 py-1.5 flex items-center justify-around safe-area-bottom select-none"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab('chat')}
                className="relative -top-2 flex flex-col items-center justify-center p-1 cursor-pointer group"
                title="Tap to chat with Gemini AI"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#1976D2] text-white ring-4 ring-blue-100'
                      : 'bg-gradient-to-tr from-[#1976D2] to-[#42A5F5] text-white'
                  }`}
                >
                  <Icon size={22} className="group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-0.5">
                  AI Bot
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#1976D2] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-[#EAF3FF]' : 'bg-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#1976D2]' : 'text-slate-500'} />
              </div>
              <span className="text-[10px] font-medium leading-none mt-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
