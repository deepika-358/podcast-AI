import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, 
  BookOpen, 
  Mic, 
  Filter, 
  Clock, 
  ExternalLink, 
  Play, 
  History as HistoryIcon,
  X,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchPaper, Podcast, SearchHistoryItem } from '../types/index';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useToast } from '../context/ToastContext';

interface SearchPageProps {
  navigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ navigate }) => {
  const { loadAndPlayPodcast } = useAudioPlayer();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'papers' | 'podcasts'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing'>('all');
  
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const executeSearch = async (searchTerm: string = query) => {
    try {
      setIsLoading(true);
      const res = await api.search(searchTerm, filterType, filterStatus);
      setPapers(res.results.papers);
      setPodcasts(res.results.podcasts);
      setSearchHistory(res.searchHistory || []);
    } catch (err: any) {
      showToast('Search query failed: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [filterType, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleHistoryTagClick = (tag: string) => {
    setQuery(tag);
    executeSearch(tag);
  };

  const totalResults = papers.length + podcasts.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Search Research & Podcasts
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Query your database of research papers, author citations, methodology tags, and podcast transcripts.
        </p>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
        <div className="relative">
          <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by paper title, author name, keyword, or finding..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xl transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                executeSearch('');
              }}
              className="absolute right-24 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
          >
            Search
          </button>
        </div>
      </form>

      {/* Recent Search Queries */}
      {searchHistory.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <HistoryIcon className="w-3 h-3" /> Recent:
          </span>
          {searchHistory.map((item) => (
            <button
              key={item.id}
              onClick={() => handleHistoryTagClick(item.query)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              {item.query}
            </button>
          ))}
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        
        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({totalResults})
            </button>
            <button
              onClick={() => setFilterType('papers')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'papers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Papers ({papers.length})
            </button>
            <button
              onClick={() => setFilterType('podcasts')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'podcasts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Podcasts ({podcasts.length})
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed Ready</option>
            <option value="processing">Processing</option>
          </select>
        </div>

      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Searching database...</span>
        </div>
      ) : totalResults === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <SearchIcon className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No matching research results.</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or uploading new papers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Research Papers Results */}
          {filterType !== 'podcasts' && papers.map((paper) => (
            <div
              key={paper.id}
              className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-indigo-400 font-semibold flex items-center gap-1.5 uppercase">
                  <BookOpen className="w-3.5 h-3.5" />
                  Research Paper
                </span>
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(paper.uploadedAt).toLocaleDateString()}
                </span>
              </div>

              <h3 
                onClick={() => navigate(`/papers/${paper.id}`)}
                className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {paper.title}
              </h3>

              <p className="text-xs text-slate-400">
                <strong>Authors:</strong> {paper.authors.join(', ')}
              </p>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {paper.abstract}
              </p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {paper.keywords?.slice(0, 4).map((kw, i) => (
                    <span key={i} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      #{kw}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/papers/${paper.id}`)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Podcasts Results */}
          {filterType !== 'papers' && podcasts.map((pod) => (
            <div
              key={pod.id}
              className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-semibold flex items-center gap-1.5 uppercase">
                  <Mic className="w-3.5 h-3.5" />
                  AI Podcast Episode ({Math.floor(pod.duration / 60)}m {pod.duration % 60}s)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {pod.status}
                </span>
              </div>

              <h3 
                onClick={() => navigate(`/podcasts/${pod.id}`)}
                className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {pod.title}
              </h3>

              <p className="text-xs text-slate-400 truncate">
                Based on: {pod.paperTitle}
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => loadAndPlayPodcast(pod)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Episode</span>
                </button>

                <button
                  onClick={() => navigate(`/podcasts/${pod.id}`)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Open Episode</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
};
