import React, { useState } from 'react';
import { UserProfile, SearchRecord, recordSearchToFirestore, deleteSearchFromFirestore } from '../firebase';
import { AudioTranscriberModal } from './AudioTranscriberModal';
import {
  Search,
  X,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Bot,
  Database,
  CheckCircle2,
  Bookmark,
  Mic
} from 'lucide-react';

interface SearchViewProps {
  user: UserProfile;
  searchHistory: SearchRecord[];
  initialQuery?: string;
  onSearchStateChange?: (active: boolean) => void;
  onItemSaved?: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  user,
  searchHistory,
  initialQuery = 'machine learning',
  onSearchStateChange,
  onItemSaved,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [showTranscriber, setShowTranscriber] = useState(false);

  // Default items matching the bottom-middle screenshot
  const defaultItems = [
    {
      id: 'ml-intro',
      icon: FileText,
      iconBg: 'bg-[#EAF3FF]',
      iconColor: 'text-[#1976D2]',
      title: 'Introduction to Machine Learning',
      snippet: 'Machine learning is a branch of AI that allows computers to learn from data...',
      details: 'Machine learning algorithms build a model based on sample data, known as training data, in order to make predictions or decisions without being explicitly programmed to do so. Common types include supervised learning, unsupervised learning, and reinforcement learning.',
      tags: ['AI', 'Fundamentals', 'Algorithms'],
    },
    {
      id: 'ml-basics',
      icon: ImageIcon,
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#10B981]',
      title: 'Machine Learning Basics',
      snippet: 'Learn the core concepts, algorithms and real-world applications of machine learning...',
      details: 'Explore foundational concepts such as regression, classification, clustering, neural networks, loss functions, gradient descent, and validation curves across real-world datasets.',
      tags: ['Concepts', 'Applications', 'Neural Networks'],
    },
    {
      id: 'ml-tutorial',
      icon: LinkIcon,
      iconBg: 'bg-[#F5F3FF]',
      iconColor: 'text-[#8B5CF6]',
      title: 'ML Tutorial',
      snippet: 'A step-by-step guide to get started with machine learning using Python...',
      details: 'Hands-on tutorial walking through setting up Python, NumPy, Pandas, Scikit-Learn, and building your first predictive model from data ingestion to evaluation metrics.',
      tags: ['Python', 'Code', 'Tutorial'],
    },
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    if (onSearchStateChange) onSearchStateChange(true);

    try {
      // Record search to Firebase Firestore
      await recordSearchToFirestore(user.uid, {
        query: query.trim(),
        title: query.trim(),
        summary: `AI synthesized results and verified resources for "${query.trim()}".`,
        insights: [
          `Key principles extracted for ${user.displayName}.`,
          `Synchronized with Firebase Firestore.`,
          `Semantic relevance score: 98%`
        ],
        recommendedTags: ['Machine Learning', 'Ebolt Search', 'AI'],
        metrics: [
          { category: 'Relevance', score: 95 },
          { category: 'Depth', score: 90 },
          { category: 'Accuracy', score: 96 },
          { category: 'Utility', score: 92 },
        ],
        category: 'AI & Knowledge',
      });
    } catch (err) {
      console.error('Search recording error:', err);
    } finally {
      setLoading(false);
      if (onSearchStateChange) onSearchStateChange(false);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div id="ebolt-search-view" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Search Results Heading matching Screenshot */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Search Results
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time AI search and index for {user.displayName}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
          <Database size={13} className="text-[#1976D2]" />
          <span>Firebase Sync Active</span>
        </div>
      </div>

      {/* Audio Transcriber Modal with gemini-3.5-transcribe */}
      <AudioTranscriberModal
        isOpen={showTranscriber}
        onClose={() => setShowTranscriber(false)}
        userId={user.uid}
        onInsertText={(text) => setQuery(text)}
      />

      {/* Search Input Box matching Screenshot */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={19} className="text-slate-400 flex-shrink-0" />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search query or click mic to dictate..."
            className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
          />

          {/* Voice Search Dictate Button */}
          <button
            type="button"
            onClick={() => setShowTranscriber(true)}
            title="Dictate with voice (gemini-3.5-transcribe)"
            className="text-slate-400 hover:text-[#1976D2] p-1 flex-shrink-0 cursor-pointer transition-colors"
          >
            <Mic size={18} />
          </button>

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-1 flex-shrink-0 cursor-pointer"
              title="Clear input"
            >
              <X size={17} />
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-10 h-10 rounded-xl bg-[#1976D2] hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer flex-shrink-0"
            title="Execute Search"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Search size={18} />
            )}
          </button>
        </div>
      </form>

      {/* Result Items List matching Screenshot */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
        {defaultItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedResult(item)}
              className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                {/* Square Icon with matching background */}
                <div
                  className={`w-12 h-12 rounded-2xl ${item.iconBg} ${item.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}
                >
                  <Icon size={22} />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                    {item.snippet}
                  </p>
                </div>
              </div>

              {/* Chevron Right matching Screenshot */}
              <div className="text-slate-400 group-hover:text-slate-700 transition-colors pr-2">
                <ChevronRight size={18} />
              </div>
            </div>
          );
        })}

        {/* Dynamic Firestore search history items if any */}
        {searchHistory.filter((s) => s.query.toLowerCase() !== 'machine learning').slice(0, 3).map((s) => (
          <div
            key={s.id}
            onClick={() =>
              setSelectedResult({
                title: s.title || s.query,
                snippet: s.summary,
                details: s.insights.join('\n'),
                tags: s.recommendedTags,
              })
            }
            className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {s.title || s.query}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                  {s.summary}
                </p>
              </div>
            </div>
            <div className="text-slate-400 group-hover:text-slate-700 transition-colors pr-2">
              <ChevronRight size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedResult.title}
                </h3>
                <p className="text-xs text-blue-600 font-medium mt-0.5">
                  Verified Knowledge Resource
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4 whitespace-pre-line">
              {selectedResult.details || selectedResult.snippet}
            </p>

            {selectedResult.tags && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedResult.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
