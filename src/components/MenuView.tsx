import React, { useState, useRef } from 'react';
import {
  UserProfile,
  SavedDataItem,
  addSavedItemToFirestore,
  deleteSavedItemFromFirestore,
} from '../firebase';
import {
  FileText,
  Image as ImageIcon,
  FileCode,
  Folder,
  Settings,
  HelpCircle,
  Info,
  Plus,
  Trash2,
  Download,
  Upload,
  FolderOpen,
  Check,
  Search,
  X,
  ExternalLink,
  Eye,
  Sparkles
} from 'lucide-react';
import { AnimatedGroup } from '@/components/core/animated-group';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogContainer,
} from '@/components/core/morphing-dialog';
import { ScrollArea } from '@/components/website/scroll-area';

interface MenuViewProps {
  user: UserProfile;
  savedItems: SavedDataItem[];
}

export const MenuView: React.FC<MenuViewProps> = ({ user, savedItems }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Quick note state for Notes morphing dialog
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteContent, setQuickNoteContent] = useState('');
  const [quickNoteSaving, setQuickNoteSaving] = useState(false);

  const handleCreateQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteTitle.trim()) return;
    setQuickNoteSaving(true);
    try {
      await addSavedItemToFirestore(user.uid, {
        title: quickNoteTitle.trim(),
        content: quickNoteContent.trim() || 'Created in Notes.',
        category: 'note',
        tags: ['Note', 'QuickMemo'],
        pinned: false,
      });
      setQuickNoteTitle('');
      setQuickNoteContent('');
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setQuickNoteSaving(false);
    }
  };

  // Drag & drop file upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<SavedDataItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const processUploadedFile = async (file: File) => {
    setUploadStatus(`Uploading "${file.name}" to Cloud...`);
    try {
      const isImage = file.type.startsWith('image/');
      const isText =
        file.type.startsWith('text/') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.json');

      let category: SavedDataItem['category'] = 'file';
      if (isImage) category = 'image';
      else if (isText) category = 'note';
      else if (
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx')
      ) {
        category = 'document';
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        const result = e.target?.result as string;
        let content = `File: ${file.name} (${formatFileSize(file.size)})`;

        if (isText && typeof result === 'string') {
          content = result.slice(0, 1000);
        }

        await addSavedItemToFirestore(user.uid, {
          title: file.name,
          content,
          category,
          tags: ['Upload', file.type || 'file', isImage ? 'Image' : 'Document'],
          pinned: false,
          fileData: isImage || isText ? result : undefined,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          fileType: file.type || 'application/octet-stream',
        });

        setUploadStatus(`Synced "${file.name}" to Firebase`);
        setTimeout(() => setUploadStatus(null), 3500);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else if (isText) {
        reader.readAsText(file);
      } else {
        // For binary files/PDFs, read as Data URL for downloading
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadStatus('Upload failed. Please try again.');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => processUploadedFile(file));
  };

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
    handleFiles(e.dataTransfer.files);
  };

  const menuItems = [
    {
      id: 'documents',
      name: 'Documents',
      icon: FileText,
      bgColor: 'bg-[#EAF3FF]',
      iconColor: 'text-[#1976D2]',
      count: savedItems.filter((i) => i.category === 'document').length,
      subtitle: `${savedItems.filter((i) => i.category === 'document').length} documents`,
      modalSubtitle: 'Cloud Synchronized Word & PDF Documents',
      bannerImg: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'images',
      name: 'Images',
      icon: ImageIcon,
      bgColor: 'bg-[#ECFDF5]',
      iconColor: 'text-[#10B981]',
      count: savedItems.filter((i) => i.category === 'image' || i.category === 'search_insight').length,
      subtitle: `${savedItems.filter((i) => i.category === 'image' || i.category === 'search_insight').length} images`,
      modalSubtitle: 'High-Resolution Media & Visual Gallery',
      bannerImg: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: FileCode,
      bgColor: 'bg-[#F5F3FF]',
      iconColor: 'text-[#8B5CF6]',
      count: savedItems.filter((i) => i.category === 'note').length,
      subtitle: `${savedItems.filter((i) => i.category === 'note').length} notes`,
      modalSubtitle: 'Instant Scratchpad & Synchronized Memos',
      bannerImg: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'files',
      name: 'Files',
      icon: Folder,
      bgColor: 'bg-[#FFF7ED]',
      iconColor: 'text-[#F97316]',
      count: savedItems.filter((i) => i.category === 'file' || i.category === 'bookmark').length,
      subtitle: `${savedItems.filter((i) => i.category === 'file' || i.category === 'bookmark').length} files`,
      modalSubtitle: 'All Cloud Storage & Downloadable Files',
      bannerImg: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      bgColor: 'bg-[#EAF3FF]',
      iconColor: 'text-[#1976D2]',
      subtitle: 'System & Sync',
      modalSubtitle: 'Account, Storage Quota & Preferences',
      bannerImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'help',
      name: 'Help',
      icon: HelpCircle,
      bgColor: 'bg-[#EAF3FF]',
      iconColor: 'text-[#1976D2]',
      subtitle: 'FAQs & Guide',
      modalSubtitle: 'Guides, Shortcuts & Assistance',
      bannerImg: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'about',
      name: 'About',
      icon: Info,
      bgColor: 'bg-[#EAF3FF]',
      iconColor: 'text-[#1976D2]',
      subtitle: 'Version 2.2',
      modalSubtitle: 'Ebolt Smart Workspace Architecture',
      bannerImg: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    setSaving(true);
    try {
      let cat: SavedDataItem['category'] = 'document';
      if (selectedCategory === 'notes') cat = 'note';
      if (selectedCategory === 'images') cat = 'image';
      if (selectedCategory === 'files') cat = 'file';

      await addSavedItemToFirestore(user.uid, {
        title: modalTitle,
        content: modalContent || 'Created in Ebolt workspace.',
        category: cat,
        tags: ['Ebolt', selectedCategory || 'general'],
        pinned: false,
      });

      setModalTitle('');
      setModalContent('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    await deleteSavedItemFromFirestore(user.uid, id);
  };

  const handleDownloadFile = (item: SavedDataItem) => {
    if (!item.fileData) return;
    const a = document.createElement('a');
    a.href = item.fileData;
    a.download = item.fileName || item.title || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredItems = selectedCategory
    ? savedItems.filter((i) => {
        if (selectedCategory === 'documents') return i.category === 'document';
        if (selectedCategory === 'images') return i.category === 'image' || i.category === 'search_insight';
        if (selectedCategory === 'notes') return i.category === 'note';
        if (selectedCategory === 'files') return i.category === 'file' || i.category === 'bookmark';
        return true;
      })
    : savedItems;

  const renderDialogBody = (itemId: string) => {
    if (itemId === 'documents') {
      const docs = savedItems.filter((i) => i.category === 'document');
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {docs.length} {docs.length === 1 ? 'document' : 'documents'} stored in cloud
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1976D2] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload size={13} />
                <span>Upload Document</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('documents');
                  setShowAddModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#1976D2] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>New Doc</span>
              </button>
            </div>
          </div>

          {docs.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <FileText size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No documents uploaded yet</p>
              <p className="text-xs text-slate-400 mt-1">Upload PDF, Word, or text files to sync them</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1976D2] flex items-center justify-center flex-shrink-0">
                      <FileText size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{doc.title}</p>
                      <p className="text-[11px] text-slate-400">{doc.fileSize || 'Text Document'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.fileData && (
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(doc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#1976D2] hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Download"
                      >
                        <Download size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (itemId === 'images') {
      const imgs = savedItems.filter(
        (i) => i.category === 'image' || i.category === 'search_insight'
      );
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {imgs.length} {imgs.length === 1 ? 'image' : 'images'} stored
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload size={13} />
              <span>Upload Image</span>
            </button>
          </div>

          {imgs.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No images stored yet</p>
              <p className="text-xs text-slate-400 mt-1">Upload JPG, PNG, or SVG files to view them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {imgs.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-square bg-slate-100"
                >
                  {img.fileData ? (
                    <img
                      src={img.fileData}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                      <ImageIcon size={24} className="text-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-500 truncate max-w-full font-medium">
                        {img.title}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {img.fileData && (
                      <button
                        type="button"
                        onClick={() => setPreviewItem(img)}
                        className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white cursor-pointer"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    {img.fileData && (
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(img)}
                        className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white cursor-pointer"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(img.id)}
                      className="p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-white cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (itemId === 'notes') {
      const notes = savedItems.filter((i) => i.category === 'note');
      return (
        <div className="space-y-4">
          {/* Quick Note Composer */}
          <form onSubmit={handleCreateQuickNote} className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2.5">
            <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              Quick Note Scratchpad
            </h4>
            <input
              type="text"
              placeholder="Note Title..."
              value={quickNoteTitle}
              onChange={(e) => setQuickNoteTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <textarea
              placeholder="Write a quick thought, memo, or reminder..."
              value={quickNoteContent}
              onChange={(e) => setQuickNoteContent(e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={quickNoteSaving || !quickNoteTitle.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>{quickNoteSaving ? 'Saving...' : 'Save to Firebase'}</span>
              </button>
            </div>
          </form>

          {/* Saved Notes List */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">
              Saved Notes ({notes.length})
            </p>
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No notes created yet. Type above to create one!</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{note.title}</h5>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{note.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="text-slate-400 hover:text-red-500 p-1 flex-shrink-0 cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (itemId === 'files') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Total stored items: {savedItems.length}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload size={13} />
              <span>Upload New File</span>
            </button>
          </div>

          {savedItems.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <Folder size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Storage is empty</p>
              <p className="text-xs text-slate-400 mt-1">Upload any file or image to start building your library</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {savedItems.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/40 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                      <Folder size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{file.title}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {file.category} • {file.fileSize || 'Standard'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {file.fileData && (
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(file)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
                        title="Download file"
                      >
                        <Download size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(file.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete file"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (itemId === 'settings') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Connected Profile & Database
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">User Email</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">{user.email}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Display Name</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">{user.displayName || 'Ravi'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cloud Database</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sync Mode</span>
                <span className="font-semibold text-blue-600 mt-0.5 block">Real-Time Firestore</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-900">Drag & Drop Upload</p>
              <p className="text-[11px] text-blue-700/80">Support for PDF, Images, Code and Documents</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-full shadow-2xs border border-blue-200">
              Active
            </span>
          </div>
        </div>
      );
    }

    if (itemId === 'help') {
      return (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <FolderOpen size={14} className="text-[#1976D2]" />
              How do I upload files or documents?
            </h5>
            <p className="text-[11px] text-slate-600 mt-1">
              Drag & drop any file directly from your computer onto the designated upload box, or click the "Browse local folder" button to select files.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle size={14} className="text-[#1976D2]" />
              How do I chat with the AI assistant?
            </h5>
            <p className="text-[11px] text-slate-600 mt-1">
              Click the interactive 3D robot avatar on the Home screen to open the Gemini AI conversation and request assistance or summarizations.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Check size={14} className="text-emerald-600" />
              Where is my data synchronized?
            </h5>
            <p className="text-[11px] text-slate-600 mt-1">
              All items, notes, documents, and preferences are automatically synchronized in real-time with Google Cloud Firestore database.
            </p>
          </div>
        </div>
      );
    }

    // itemId === 'about'
    return (
      <div className="space-y-3 text-xs">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">Ebolt Workspace</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#1976D2] font-mono text-[10px] font-bold">
              v2.2.0
            </span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Ebolt is a unified cloud workspace combining real-time file management, document syncing, media gallery, note taking, and Gemini AI agent assistance.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Architecture & Tech Stack</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {['React 19', 'Tailwind CSS', 'Motion Primitives', 'Morphing Dialog', 'Firebase Firestore', 'Gemini Flash'].map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="ebolt-menu-view" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Menu Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Manu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud files, documents, and real-time synchronized items
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnimKey((k) => k + 1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs border border-purple-200 transition-all cursor-pointer shadow-2xs"
            title="Replay entrance animation"
          >
            <Sparkles size={14} />
            <span>Animate Cards</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1976D2] font-semibold text-xs border border-blue-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Upload size={14} />
            <span>Upload File</span>
          </button>

          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium px-2 py-1"
            >
              ← All categories
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input for Native Browse */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* DRAG & DROP UPLOAD ZONE (User Requested Feature) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-8 p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 scale-[1.01] shadow-md'
            : 'border-slate-300 hover:border-blue-400 bg-white shadow-2xs hover:shadow-xs'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center mb-3 shadow-xs">
          <Upload size={26} />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          Drag and drop files here to upload
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Drop any images, PDF documents, notes, or files from your computer to sync instantly with Firebase
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <FolderOpen size={13} /> Browse local folder
          </span>
          <span className="text-[11px] text-slate-400">• Multi-file support</span>
        </div>
      </div>

      {/* Upload Status Toast */}
      {uploadStatus && (
        <div className="mb-6 p-3 rounded-2xl bg-blue-600 text-white text-xs font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>{uploadStatus}</span>
          </div>
          <button
            onClick={() => setUploadStatus(null)}
            className="text-white/70 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Grid of 7 Menu Cards with AnimatedGroup staggered blur-up spring animation */}
      {!selectedCategory && (
        <AnimatedGroup
          key={animKey}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10"
          variants={{
            container: {
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            },
            item: {
              hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
              visible: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: {
                  duration: 1.2,
                  type: 'spring',
                  bounce: 0.3,
                },
              },
            },
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <MorphingDialog
                key={item.id}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 24,
                }}
              >
                <MorphingDialogTrigger
                  style={{
                    borderRadius: '28px',
                  }}
                  className="h-full w-full rounded-[28px] bg-white border border-slate-200/90 hover:border-blue-300 p-8 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center cursor-pointer group min-h-[175px]"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${item.bgColor} ${item.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xs`}
                  >
                    <Icon size={26} />
                  </div>
                  <MorphingDialogTitle className="text-base font-bold text-slate-800 tracking-tight">
                    {item.name}
                  </MorphingDialogTitle>
                  <MorphingDialogSubtitle className="text-xs text-slate-400 mt-1 font-normal">
                    {item.subtitle}
                  </MorphingDialogSubtitle>
                </MorphingDialogTrigger>

                <MorphingDialogContainer>
                  <MorphingDialogContent
                    style={{
                      borderRadius: '24px',
                    }}
                    className="relative h-auto w-full max-w-xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden"
                  >
                    <ScrollArea className="max-h-[82vh]" type="scroll">
                      <div className="relative p-6 sm:p-8">
                        {/* Header Banner Image */}
                        <div className="w-full h-36 rounded-2xl overflow-hidden mb-6 bg-slate-100 relative">
                          <MorphingDialogImage
                            src={item.bannerImg}
                            alt={`${item.name} banner`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-11 h-11 rounded-xl ${item.bgColor} ${item.iconColor} flex items-center justify-center shadow-md flex-shrink-0`}
                              >
                                <Icon size={22} />
                              </div>
                              <div>
                                <MorphingDialogTitle className="text-xl font-bold text-white leading-tight">
                                  {item.name}
                                </MorphingDialogTitle>
                                <MorphingDialogSubtitle className="text-xs text-slate-200 font-medium">
                                  {item.modalSubtitle}
                                </MorphingDialogSubtitle>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Dialog Content for Each Category */}
                        {renderDialogBody(item.id)}
                      </div>
                    </ScrollArea>
                    <MorphingDialogClose className="text-slate-500 hover:text-slate-900 bg-white/90 shadow-md backdrop-blur-xs" />
                  </MorphingDialogContent>
                </MorphingDialogContainer>
              </MorphingDialog>
            );
          })}
        </AnimatedGroup>
      )}

      {/* Recent Files & Uploads Section */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 capitalize">
              {selectedCategory ? `${selectedCategory} Collection` : 'All Stored Items'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredItems.length} items synchronized for {user.displayName || 'Ravi'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1976D2] hover:bg-blue-600 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Create New</span>
          </button>
        </div>

        {/* Selected Category: Settings / Help / About details */}
        {selectedCategory === 'settings' && (
          <div className="space-y-4 text-xs text-slate-600 mb-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 text-sm mb-1">Account & Storage</p>
              <p>Logged in: <strong className="text-slate-800">{user.email}</strong></p>
              <p className="mt-1">Cloud Firestore: <span className="text-emerald-600 font-semibold">Online & Synchronized</span></p>
              <p className="mt-1">Drag & Drop Uploads: <span className="text-blue-600 font-semibold">Enabled</span></p>
            </div>
          </div>
        )}

        {selectedCategory === 'help' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 mb-6">
            <p className="font-bold text-slate-900 text-sm">Help & Guidance</p>
            <p>• Drag and drop any image or file directly onto the upload zone above.</p>
            <p>• Click on any image thumbnail to view full-resolution preview.</p>
            <p>• Download your files anytime using the download icon.</p>
          </div>
        )}

        {selectedCategory === 'about' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 mb-6">
            <p className="font-bold text-slate-900 text-sm">About Ebolt</p>
            <p>Ebolt is a high-performance productivity workspace with built-in AI assistance and instant cloud synchronization.</p>
            <p className="text-slate-400 font-mono text-[11px]">Version 2.2 • Drag & Drop Enabled</p>
          </div>
        )}

        {/* List of Files / Uploaded Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <p>No files or items in this section yet.</p>
            <p className="mt-1 text-slate-400">
              Drag & drop a file above or click "Upload File" to save your first item!
            </p>
          </div>
        ) : (
          <AnimatedGroup
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={{
              container: {
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              },
              item: {
                hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: {
                    duration: 1.2,
                    type: 'spring',
                    bounce: 0.3,
                  },
                },
              },
            }}
          >
            {filteredItems.map((item) => {
              const isImg = item.category === 'image' && item.fileData;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-50/80 border border-slate-200/90 p-4 flex flex-col justify-between hover:border-blue-300 hover:bg-white transition-all group"
                >
                  {/* Image thumbnail if it's an image file */}
                  {isImg && (
                    <div
                      onClick={() => setPreviewItem(item)}
                      className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-slate-200 cursor-pointer relative group-hover:opacity-95"
                    >
                      <img
                        src={item.fileData}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                        <Eye size={16} />
                        <span>View</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {item.category === 'image' ? (
                            <ImageIcon size={14} />
                          ) : item.category === 'note' ? (
                            <FileCode size={14} />
                          ) : (
                            <FileText size={14} />
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate" title={item.title}>
                          {item.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Delete from Firestore"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                      {item.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      {item.fileSize && (
                        <span className="font-mono bg-slate-200/60 text-slate-700 px-1.5 py-0.5 rounded">
                          {item.fileSize}
                        </span>
                      )}
                      <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.fileData && (
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(item)}
                          className="text-blue-600 hover:text-blue-800 p-1 flex items-center gap-0.5 font-medium"
                          title="Download file"
                        >
                          <Download size={12} />
                          <span>Get</span>
                        </button>
                      )}
                      <span className="text-emerald-600 font-medium">Synced</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </AnimatedGroup>
        )}
      </div>

      {/* Manual Create Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                New {selectedCategory?.slice(0, -1) || 'Item'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="E.g. Project Strategy Document"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content / Notes
                </label>
                <textarea
                  rows={4}
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  placeholder="Enter details..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#1976D2] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save to Cloud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image / Item Full Preview Modal */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {previewItem.title}
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {previewItem.fileData && previewItem.category === 'image' ? (
              <div className="max-h-[65vh] overflow-hidden rounded-2xl flex items-center justify-center bg-slate-900">
                <img
                  src={previewItem.fileData}
                  alt={previewItem.title}
                  className="max-h-[65vh] w-auto object-contain"
                />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-800 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                {previewItem.content}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 mt-2">
              <span className="text-xs text-slate-400">
                Size: {previewItem.fileSize || 'N/A'} • Synced to Cloud
              </span>

              {previewItem.fileData && (
                <button
                  onClick={() => handleDownloadFile(previewItem)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1976D2] text-white text-xs font-semibold hover:bg-blue-600"
                >
                  <Download size={14} />
                  <span>Download File</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
