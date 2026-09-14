import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FolderOpen,
  Check,
  Camera,
  Image as ImageIcon,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const SUGGESTED_AVATARS = [
  {
    id: 'dev_alex',
    name: 'Modern Developer',
    category: 'Tech & Pro',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'creative_sarah',
    name: 'Creative Designer',
    category: 'Tech & Pro',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'pro_ravi',
    name: 'Executive Leader',
    category: 'Tech & Pro',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'tech_maya',
    name: 'AI Strategist',
    category: 'Tech & Pro',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber_kai',
    name: 'Cyberpunk Neon',
    category: 'Art & Sci-Fi',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'astro_voyager',
    name: 'Space Explorer',
    category: 'Art & Sci-Fi',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'abstract_geo',
    name: '3D Geometric Flow',
    category: 'Art & Sci-Fi',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'studio_portrait',
    name: 'Studio Portrait',
    category: 'Art & Sci-Fi',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'zen_minimal',
    name: 'Zen Minimalist',
    category: 'Minimal & Nature',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'digital_artist',
    name: 'Digital Creator',
    category: 'Minimal & Nature',
    url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'nature_peak',
    name: 'Mountain Expedition',
    category: 'Minimal & Nature',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'urban_architect',
    name: 'Urban Vanguard',
    category: 'Minimal & Nature',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80',
  },
];

interface ProfileAvatarModalProps {
  currentAvatarUrl?: string;
  userName: string;
  onClose: () => void;
  onSaveAvatar: (avatarUrl: string) => Promise<void>;
}

export const ProfileAvatarModal: React.FC<ProfileAvatarModalProps> = ({
  currentAvatarUrl,
  userName,
  onClose,
  onSaveAvatar,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string>(currentAvatarUrl || '');
  const [previewName, setPreviewName] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = userName ? userName[0].toUpperCase() : 'R';

  // Handle local folder file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processLocalFile(file);
  };

  const processLocalFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (.jpg, .png, .webp, .svg)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        setSelectedUrl(dataUrl);
        setPreviewName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers for local folder files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLocalFile(file);
    }
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onSaveAvatar(selectedUrl);
      onClose();
    } catch (err) {
      console.error('Failed to save avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredAvatars =
    activeCategory === 'all'
      ? SUGGESTED_AVATARS
      : SUGGESTED_AVATARS.filter((a) => a.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Camera size={22} className="text-[#1976D2]" />
              <span>Customize Profile Picture</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose from your local folder or pick from curated suggested avatars
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Current Live Preview Banner */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100">
            <div className="w-18 h-18 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-bold text-2xl shadow-md overflow-hidden flex-shrink-0 border-2 border-white ring-2 ring-blue-200">
              {selectedUrl ? (
                <img
                  src={selectedUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Avatar Preview
              </p>
              <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                {selectedUrl ? (previewName || 'Selected Profile Avatar') : `Default Letter Avatar (${initial})`}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Will be displayed in your profile card, top navigation bar, and multi-account switchers.
              </p>
            </div>

            {selectedUrl && (
              <button
                type="button"
                onClick={() => {
                  setSelectedUrl('');
                  setPreviewName('');
                }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                title="Reset to default initial letter avatar"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* SECTION 1: Local Folder Upload (User Request) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <FolderOpen size={14} className="text-[#1976D2]" />
                <span>Option 1: Choose from Local Folder</span>
              </label>
              <span className="text-[11px] text-slate-400">JPG, PNG, WEBP, SVG</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Dropzone & Local Browser Trigger */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1976D2] flex items-center justify-center mb-2 shadow-xs">
                <Upload size={22} />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Click to browse your local computer folder
              </p>
              <p className="text-xs text-slate-500 mt-1">
                or drag and drop your photo directly here
              </p>
            </div>
          </div>

          {/* SECTION 2: Suggested Images Gallery (User Request) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Option 2: Suggested Profile Images</span>
              </label>

              {/* Category pills */}
              <div className="flex items-center gap-1 text-[11px]">
                {['all', 'Tech & Pro', 'Art & Sci-Fi', 'Minimal & Nature'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-full transition-colors ${
                      activeCategory === cat
                        ? 'bg-[#1976D2] text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of suggested avatars */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {filteredAvatars.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedUrl(item.url);
                      setPreviewName(item.name);
                    }}
                    className={`group relative rounded-2xl p-2 border transition-all text-center flex flex-col items-center cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-300'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden mb-1.5 shadow-2xs relative">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1976D2] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Check size={15} />
            )}
            <span>Apply Profile Picture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
