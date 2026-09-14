import React, { useState } from 'react';
import { EboltLogo } from './EboltLogo';
import { UserProfile, AccountSession } from '../firebase';
import {
  ChevronDown,
  UserPlus,
  LogOut,
  Check,
  User as UserIcon,
  Plus,
  X
} from 'lucide-react';

interface TopHeaderProps {
  user: UserProfile;
  accounts: AccountSession[];
  onSwitchAccount: (account: AccountSession) => void;
  onAddNewAccount: () => void;
  onRemoveAccount: (uid: string) => void;
  onAddQuickAccount?: (acc: { displayName: string; email: string }) => void;
  onLogout: () => void;
  onLogoutAll?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  accounts,
  onSwitchAccount,
  onAddNewAccount,
  onRemoveAccount,
  onAddQuickAccount,
  onLogout,
  onLogoutAll,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');

  // Ensure current user is in accounts display
  const allAccounts: AccountSession[] = accounts.length > 0
    ? accounts
    : [
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Ravi',
          lastActive: new Date().toISOString(),
          avatarColor: 'bg-[#1976D2]',
          avatarUrl: user.avatarUrl,
          searchCount: user.searchCount || 0,
        },
      ];

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccEmail.trim()) return;
    if (onAddQuickAccount) {
      onAddQuickAccount({
        displayName: newAccName.trim(),
        email: newAccEmail.trim(),
      });
    }
    setNewAccName('');
    setNewAccEmail('');
    setShowAddModal(false);
    setDropdownOpen(false);
  };

  const handleQuickAddDemo = (name: string, email: string) => {
    if (onAddQuickAccount) {
      onAddQuickAccount({ displayName: name, email });
    }
    setShowAddModal(false);
    setDropdownOpen(false);
  };

  return (
    <header
      id="ebolt-top-header"
      className="w-full px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-200/80 bg-white transition-colors select-none z-30"
    >
      {/* Left side: Ebolt Brand */}
      <div className="flex items-center gap-3">
        <EboltLogo theme="light" size="sm" />
      </div>

      {/* Right side: 3-Bar Histogram / Chart Icon + User Profile with Chevron + Blue Avatar */}
      <div className="relative flex items-center gap-4">
        {/* 3-Bar Histogram / Chart Icon matching Screenshot */}
        <div
          className="flex items-end gap-0.5 h-4 w-4 text-slate-800"
          title="Activity & Sync Velocity"
        >
          <div className="w-1 h-2.5 bg-slate-800 rounded-sm"></div>
          <div className="w-1 h-3.5 bg-slate-800 rounded-sm"></div>
          <div className="w-1 h-4.5 bg-slate-800 rounded-sm"></div>
        </div>

        {/* User profile dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer group"
          >
            <span className="font-semibold text-slate-900 text-sm">
              {user.displayName || 'Ravi'}
            </span>
            <ChevronDown size={14} className="text-slate-600 group-hover:text-slate-900" />
            
            {/* Blue circle avatar with white silhouette or custom uploaded image */}
            <div className="w-8 h-8 rounded-full bg-[#1976D2] text-white flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={17} className="text-white fill-white/80" />
              )}
            </div>
          </button>

          {/* Account Switcher Dropdown */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 p-3 space-y-2.5">
                
                {/* Active Account Section */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Current Account
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden flex-shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{user.displayName ? user.displayName[0].toUpperCase() : 'R'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.displayName || 'Ravi'}
                      </p>
                      <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
                    </div>

                    {/* Active account remove (-) button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAccount(user.uid);
                      }}
                      className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Remove active account (-)"
                    >
                      <span className="font-mono text-red-600 font-black text-sm leading-none">(-)</span>
                      <span className="text-[10px] font-semibold text-red-600">Remove</span>
                    </button>
                  </div>
                </div>

                {/* Switch to Another Account List */}
                <div>
                  <div className="flex items-center justify-between px-1 mb-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Switch Account
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {allAccounts.length} saved
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                    {allAccounts.map((acc) => {
                      const isCurrent = acc.uid === user.uid;
                      return (
                        <div
                          key={acc.uid}
                          className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                            isCurrent
                              ? 'bg-blue-50/70 border-blue-200'
                              : 'bg-white hover:bg-slate-50 border-slate-100'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (!isCurrent) {
                                onSwitchAccount(acc);
                                setDropdownOpen(false);
                              }
                            }}
                            className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                            title={isCurrent ? 'Current active account' : `Switch to ${acc.displayName}`}
                          >
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden flex-shrink-0">
                              {acc.avatarUrl ? (
                                <img
                                  src={acc.avatarUrl}
                                  alt={acc.displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{acc.displayName ? acc.displayName[0].toUpperCase() : 'U'}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate leading-tight">
                                {acc.displayName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">
                                {acc.email}
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                            {isCurrent ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-0.5">
                                <Check size={11} className="text-emerald-600" /> Active
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onSwitchAccount(acc);
                                  setDropdownOpen(false);
                                }}
                                className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1976D2] font-semibold text-[11px] cursor-pointer transition-colors"
                              >
                                Switch
                              </button>
                            )}

                            {/* Red (-) Remove Option Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveAccount(acc.uid);
                              }}
                              className="px-1.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-bold text-xs flex items-center gap-0.5 transition-all cursor-pointer shadow-2xs group/del"
                              title={`Remove ${acc.displayName} (-)`}
                            >
                              <span className="font-mono text-red-600 font-black text-xs">(-)</span>
                              <span className="text-[10px] font-medium text-red-600 group-hover/del:underline">
                                Remove
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions: Add Another Account & Sign Out */}
                <div className="border-t border-slate-100 pt-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-blue-700 bg-blue-50/60 hover:bg-blue-100/70 transition-colors font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus size={14} className="text-[#1976D2]" />
                      <span>Add another account</span>
                    </div>
                    <Plus size={13} className="text-[#1976D2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
                  >
                    <LogOut size={14} className="text-slate-500" />
                    <span>Sign Out Current Account</span>
                  </button>

                  {onLogoutAll && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogoutAll();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-semibold cursor-pointer border border-red-200/60 mt-1"
                    >
                      <LogOut size={14} className="text-red-600" />
                      <span>Log Out All Accounts</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Another Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1976D2] flex items-center justify-center">
                  <UserPlus size={16} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Add Another Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Add a second profile or work account to switch between accounts seamlessly.
            </p>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah.work@ebolt.app"
                  value={newAccEmail}
                  onChange={(e) => setNewAccEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#1976D2] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Add & Switch
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-100">
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
                Quick Test Accounts (1-Click Switch)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAddDemo('Alex Chen (Work)', 'alex.chen@ebolt.app')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left text-[11px] cursor-pointer transition-colors"
                >
                  <p className="font-bold text-slate-800">Alex Chen</p>
                  <p className="text-[10px] text-slate-400 truncate">alex.chen@ebolt.app</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddDemo('Sarah Jenkins (Lead)', 'sarah.j@ebolt.app')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left text-[11px] cursor-pointer transition-colors"
                >
                  <p className="font-bold text-slate-800">Sarah Jenkins</p>
                  <p className="text-[10px] text-slate-400 truncate">sarah.j@ebolt.app</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
