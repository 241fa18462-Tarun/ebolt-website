import React from 'react';
import { EboltLogo } from './EboltLogo';
import { Home, Search, LayoutGrid, User } from 'lucide-react';

export type NavTab = 'home' | 'search' | 'menu' | 'profile';

interface BottomNavBarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  savedItemCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'menu', label: 'Menu', icon: LayoutGrid },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <footer
      id="ebolt-bottom-navigation"
      className="w-full bg-white border-t border-slate-200/80 px-6 py-3 flex items-center justify-between transition-colors select-none"
    >
      {/* Left side: Ebolt Logo matching Screenshot */}
      <div>
        <EboltLogo theme="light" size="sm" />
      </div>

      {/* Right side: Horizontal Tab List matching Screenshot */}
      <div className="flex items-center gap-6 sm:gap-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#1976D2] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#1976D2]' : 'text-slate-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};
