import React, { useState } from 'react';
import { UserProfile, AccountSession, updateUserProfileInFirestore } from '../firebase';
import {
  Settings,
  Clock,
  HelpCircle,
  ChevronRight,
  LogOut,
  Smartphone,
  X,
  Check,
  Camera,
  FolderOpen,
  Sparkles,
  ShieldCheck,
  UserPlus,
  Plus
} from 'lucide-react';
import { ProfileAvatarModal } from './ProfileAvatarModal';

interface ProfileViewProps {
  user: UserProfile;
  accounts: AccountSession[];
  onSwitchAccount: (account: AccountSession) => void;
  onAddNewAccount: () => void;
  onRemoveAccount: (uid: string) => void;
  onAddQuickAccount?: (acc: { displayName: string; email: string }) => void;
  onLogout: () => void;
  onLogoutAll?: () => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  accounts,
  onSwitchAccount,
  onAddNewAccount,
  onRemoveAccount,
  onAddQuickAccount,
  onLogout,
  onLogoutAll,
  onUpdateProfile,
}) => {
  const [activeModal, setActiveModal] = useState<'settings' | 'activity' | 'support' | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');

  const initial = user.displayName ? user.displayName[0].toUpperCase() : 'R';

  const handleSaveAvatar = async (avatarUrl: string) => {
    try {
      await updateUserProfileInFirestore(user.uid, { avatarUrl });
      if (onUpdateProfile) {
        await onUpdateProfile({ avatarUrl });
      }
    } catch (err) {
      console.error('Failed to update avatar:', err);
    }
  };

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
    setShowAddAccountModal(false);
  };

  const handleQuickAddDemo = (name: string, email: string) => {
    if (onAddQuickAccount) {
      onAddQuickAccount({ displayName: name, email });
    }
    setShowAddAccountModal(false);
  };

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

  return (
    <div id="ebolt-profile-view" className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* My Profile Heading */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Profile
        </h1>

        <button
          onClick={() => setShowAvatarModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-[#1976D2] hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer border border-blue-200"
        >
          <Camera size={14} />
          <span>Change Avatar</span>
        </button>
      </div>

      {/* Main Profile Card matching Screenshot */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* User Info Header: Avatar + Name + Email + Role */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Circular Avatar with Camera edit icon overlay */}
          <div className="relative group">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-bold text-3xl shadow-md overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute -bottom-1 -right-1 p-2 bg-white text-slate-700 border border-slate-200 rounded-full shadow-md hover:bg-slate-50 transition-colors cursor-pointer group-hover:scale-105"
              title="Change Avatar (Local Files & Suggestions)"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {user.displayName || 'Ravi'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1976D2] text-[10px] font-bold border border-blue-200">
                Pro
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Account
              </span>
            </div>
            <p className="text-sm text-slate-500 font-mono">{user.email}</p>
            <p className="text-xs text-slate-400">
              Workspace UID: <span className="font-mono text-slate-600">{user.uid.slice(0, 8)}...</span>
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">Searches Run</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{user.searchCount || 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">Cloud Sync</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">Active</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-400 font-medium">Saved Accounts</p>
            <p className="text-lg font-bold text-[#1976D2] mt-0.5">{allAccounts.length}</p>
          </div>
        </div>

        {/* Account Menu Items matching Screenshot: Settings, Activity Log, Help & Support */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveModal('settings')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Settings size={18} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Account Settings
              </span>
            </div>
            <ChevronRight size={17} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          <button
            onClick={() => setActiveModal('activity')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Clock size={18} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Activity Log
              </span>
            </div>
            <ChevronRight size={17} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          <button
            onClick={() => setActiveModal('support')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <HelpCircle size={18} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Help & Support
              </span>
            </div>
            <ChevronRight size={17} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>
        </div>

        {/* Logout Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <LogOut size={16} className="text-slate-500" />
            <span>Sign Out Current</span>
          </button>

          {onLogoutAll && (
            <button
              onClick={onLogoutAll}
              className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <LogOut size={16} />
              <span>Log Out All Accounts</span>
            </button>
          )}
        </div>
      </div>

      {/* Accounts on this Device: Active Account, Switch Account, and Red (-) Remove option */}
      <div className="mt-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone size={18} className="text-[#1976D2]" />
              <span>Accounts on this Device</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quickly switch profiles or remove saved accounts with the red <span className="text-red-600 font-bold font-mono">(-)</span> option.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onLogoutAll && allAccounts.length > 0 && (
              <button
                onClick={onLogoutAll}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer border border-red-200"
                title="Log out and clear all accounts from device"
              >
                <LogOut size={13} />
                <span>Log Out All</span>
              </button>
            )}
            <button
              onClick={() => setShowAddAccountModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1976D2] text-xs font-bold transition-colors cursor-pointer border border-blue-200"
            >
              <Plus size={14} />
              <span>Add Account</span>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {allAccounts.map((acc) => {
            const isCurrent = acc.uid === user.uid;
            return (
              <div
                key={acc.uid}
                className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-200 shadow-2xs ring-1 ring-blue-200/60'
                    : 'bg-slate-50/70 hover:bg-slate-100/60 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1976D2] text-white flex items-center justify-center text-sm font-bold shadow-2xs overflow-hidden flex-shrink-0">
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{acc.displayName}</p>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate">{acc.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {/* Switch Account Button if not current */}
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => onSwitchAccount(acc)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-xs font-semibold text-[#1976D2] cursor-pointer shadow-2xs transition-colors"
                      title={`Switch to ${acc.displayName}`}
                    >
                      Switch
                    </button>
                  )}

                  {/* Red (-) Remove Option Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveAccount(acc.uid)}
                    className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs group/rmv"
                    title={`Remove account ${acc.displayName} (-)`}
                  >
                    <span className="font-mono text-red-600 font-black text-sm leading-none">(-)</span>
                    <span className="text-[11px] font-semibold text-red-600 group-hover/rmv:underline">
                      Remove
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Another Account Modal Dialog */}
      {showAddAccountModal && (
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
                onClick={() => setShowAddAccountModal(false)}
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
                  placeholder="e.g. Alex Chen"
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
                  placeholder="e.g. alex.chen@ebolt.app"
                  value={newAccEmail}
                  onChange={(e) => setNewAccEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
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

      {/* Custom Profile Avatar Modal (Local Folder & Suggested Images) */}
      {showAvatarModal && (
        <ProfileAvatarModal
          currentAvatarUrl={user.avatarUrl}
          userName={user.displayName || 'Ravi'}
          onClose={() => setShowAvatarModal(false)}
          onSaveAvatar={handleSaveAvatar}
        />
      )}

      {/* Modal Dialogs for Settings, Activity, Help */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {activeModal === 'settings'
                  ? 'Account Settings'
                  : activeModal === 'activity'
                  ? 'Activity Log'
                  : 'Help & Support'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {activeModal === 'settings' && (
              <div className="space-y-3 text-xs text-slate-600">
                <p><strong>Name:</strong> {user.displayName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Firebase UID:</strong> <span className="font-mono text-slate-500">{user.uid}</span></p>
                <p><strong>Database:</strong> Firestore Isolated Collection</p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <ShieldCheck size={14} /> Verified Cloud Session
                  </span>
                </div>
              </div>
            )}

            {activeModal === 'activity' && (
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-semibold text-slate-900">Signed In</p>
                  <p className="text-slate-400 text-[11px]">{new Date().toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-semibold text-slate-900">Searched "machine learning"</p>
                  <p className="text-slate-400 text-[11px]">Synced to Firestore</p>
                </div>
              </div>
            )}

            {activeModal === 'support' && (
              <div className="space-y-2 text-xs text-slate-600">
                <p>Need assistance with Ebolt?</p>
                <p>• Our AI assistant can help with research, summarization, and data categorization.</p>
                <p>• For database questions, all data is encrypted in Google Cloud Firestore.</p>
              </div>
            )}

            <div className="flex justify-end pt-4 mt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
