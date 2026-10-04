import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Play, 
  Trash2, 
  Star, 
  Plus, 
  Clock, 
  ExternalLink,
  Search,
  Sparkles,
  CheckCircle2,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import { Podcast } from '../types/index';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useToast } from '../context/ToastContext';
import { downloadPodcastWavFile } from '../utils/audioGenerator';

interface PodcastsListPageProps {
  navigate: (path: string) => void;
}

export const PodcastsListPage: React.FC<PodcastsListPageProps> = ({ navigate }) => {
  const { loadAndPlayPodcast } = useAudioPlayer();
  const { showToast } = useToast();

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPodcasts = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPodcasts();
      setPodcasts(res.podcasts);
    } catch (err: any) {
      showToast('Failed to load podcasts: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete podcast "${title}"?`)) return;
    try {
      await api.deletePodcast(id);
      showToast('Podcast deleted.', 'success');
      fetchPodcasts();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete podcast', 'error');
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}m ${s}s`;
  };

  const filteredPodcasts = podcasts.filter(p => 
    p.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (p.paperTitle && p.paperTitle.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Mic className="w-7 h-7 text-cyan-400" />
            <span>My AI Podcasts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse and listen to all your generated dual-voice academic audio conversations.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-xl shadow-indigo-600/25 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Podcast</span>
        </button>
      </div>

      {/* Search Filter */}
      {podcasts.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter podcasts by title or paper..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Loading podcasts library...</span>
        </div>
      ) : podcasts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No podcasts generated yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Upload your academic research paper to generate your first engaging AI podcast.
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
          >
            Create Your First Podcast
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPodcasts.map((pod) => (
            <div
              key={pod.id}
              className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 flex items-center gap-1 uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    {pod.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(pod.duration)}
                    </span>
                    <button
                      onClick={() => handleDelete(pod.id, pod.title)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Delete Podcast"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3
                  onClick={() => navigate(`/podcasts/${pod.id}`)}
                  className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer leading-snug"
                >
                  {pod.title}
                </h3>

                <p className="text-xs text-slate-400 truncate">
                  Paper: {pod.paperTitle}
                </p>

                {/* Rating badge */}
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-semibold">{pod.ratingAverage || '5.0'}</span>
                  <span className="text-slate-500 text-[11px]">({pod.ratingsCount || 1} reviews)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadAndPlayPodcast(pod)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Episode</span>
                  </button>

                  <button
                    onClick={() => {
                      downloadPodcastWavFile(pod);
                      showToast('Podcast audio (.wav) downloaded!', 'success');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 hover:bg-cyan-900/50 transition-colors"
                    title="Download Audio File (.wav)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Audio (.wav)</span>
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/podcasts/${pod.id}`)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Script & Audit</span>
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
