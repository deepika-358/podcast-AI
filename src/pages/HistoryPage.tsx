import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Trash2, 
  FileUp, 
  Eye, 
  Sparkles, 
  Headphones, 
  Star, 
  Search, 
  Clock, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { UserHistoryItem } from '../types/index';
import { useToast } from '../context/ToastContext';

interface HistoryPageProps {
  navigate: (path: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [groupedHistory, setGroupedHistory] = useState<{
    today: UserHistoryItem[];
    yesterday: UserHistoryItem[];
    earlier: UserHistoryItem[];
  }>({ today: [], yesterday: [], earlier: [] });

  const [filterText, setFilterText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await api.getHistory();
      setGroupedHistory(res.grouped);
    } catch (err: any) {
      showToast('Failed to load history: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your complete activity history?')) return;
    try {
      await api.clearHistory();
      showToast('History cleared.', 'success');
      setGroupedHistory({ today: [], yesterday: [], earlier: [] });
    } catch (err: any) {
      showToast(err.message || 'Failed to clear history', 'error');
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'uploaded':
        return { icon: FileUp, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', label: 'Uploaded' };
      case 'viewed':
        return { icon: Eye, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', label: 'Viewed' };
      case 'generated':
        return { icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', label: 'Generated' };
      case 'listened':
        return { icon: Headphones, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Listened' };
      case 'rated':
        return { icon: Star, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Rated' };
      default:
        return { icon: HistoryIcon, color: 'text-slate-400 bg-slate-800 border-slate-700', label: 'Activity' };
    }
  };

  const filterItems = (items: UserHistoryItem[]) => {
    if (!filterText.trim()) return items;
    return items.filter(i => (i.title || '').toLowerCase().includes(filterText.toLowerCase()));
  };

  const hasAnyItems = 
    groupedHistory.today.length > 0 || 
    groupedHistory.yesterday.length > 0 || 
    groupedHistory.earlier.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <HistoryIcon className="w-7 h-7 text-indigo-400" />
            <span>Research Activity Timeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete chronological audit of your papers, podcast generations, listens, and reviews.
          </p>
        </div>

        {hasAnyItems && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/40 transition-colors w-fit"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search within history */}
      {hasAnyItems && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter timeline activity..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* History Feed */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading activity history...</span>
        </div>
      ) : !hasAnyItems ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <HistoryIcon className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Your activity will appear here.</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload a research paper or listen to a podcast to start building your research history.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Today Group */}
          {filterItems(groupedHistory.today).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Today
              </h3>
              <div className="space-y-2">
                {filterItems(groupedHistory.today).map((item) => {
                  const badge = getActionBadge(item.actionType);
                  const Icon = badge.icon;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl border shrink-0 ${badge.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {item.podcastId && (
                        <button
                          onClick={() => navigate(`/podcasts/${item.podcastId}`)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                        >
                          View Episode
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Yesterday Group */}
          {filterItems(groupedHistory.yesterday).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Yesterday
              </h3>
              <div className="space-y-2">
                {filterItems(groupedHistory.yesterday).map((item) => {
                  const badge = getActionBadge(item.actionType);
                  const Icon = badge.icon;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl border shrink-0 ${badge.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {item.podcastId && (
                        <button
                          onClick={() => navigate(`/podcasts/${item.podcastId}`)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                        >
                          View Episode
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {filterItems(groupedHistory.earlier).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Earlier
              </h3>
              <div className="space-y-2">
                {filterItems(groupedHistory.earlier).map((item) => {
                  const badge = getActionBadge(item.actionType);
                  const Icon = badge.icon;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl border shrink-0 ${badge.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {item.podcastId && (
                        <button
                          onClick={() => navigate(`/podcasts/${item.podcastId}`)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                        >
                          View Episode
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
