import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  BookOpen, 
  Mic, 
  Clock, 
  Star, 
  Play, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  History, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Search,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { ResearchPaper, Podcast, DashboardStats } from '../types/index';
import { PipelineProgressModal } from '../components/PipelineProgressModal';
import { PipelineProgress } from '../types/index';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { loadAndPlayPodcast, isPlaying, currentPodcast } = useAudioPlayer();
  const { showToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pipeline modal state
  const [activeJobProgress, setActiveJobProgress] = useState<PipelineProgress | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [analyticsData, papersData, podcastsData] = await Promise.all([
        api.getAnalytics(),
        api.getPapers(),
        api.getPodcasts(),
      ]);

      setStats(analyticsData);
      setPapers(papersData.papers);
      setPodcasts(podcastsData.podcasts);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      showToast('Could not load dashboard data: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGeneratePodcast = async (paperId: string) => {
    try {
      showToast('Starting podcast generation pipeline...', 'info');
      const res = await api.generatePodcast(paperId);
      
      // Poll pipeline progress
      const pollInterval = setInterval(async () => {
        try {
          const jobRes = await api.getJobProgress(res.jobId);
          setActiveJobProgress(jobRes.job);

          if (jobRes.job.status === 'completed' || jobRes.job.status === 'failed') {
            clearInterval(pollInterval);
            fetchDashboardData();
          }
        } catch (e) {
          clearInterval(pollInterval);
        }
      }, 1000);

    } catch (err: any) {
      showToast(err.message || 'Failed to start generation', 'error');
    }
  };

  const handleDeletePaper = async (paperId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deletePaper(paperId);
      showToast('Research paper deleted.', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete paper', 'error');
    }
  };

  const handleSeedSample = async (sampleType: 'alphafold' | 'generative-agents') => {
    try {
      showToast('Loading benchmark academic paper...', 'info');
      await api.seedSamplePaper(sampleType);
      showToast('Sample research paper loaded!', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast('Failed to load sample: ' + err.message, 'error');
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize">
              {user?.role || 'Researcher'} Workspace
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Academic Session Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'Researcher'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Continue exploring and converting your research papers into engaging AI podcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Podcast</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Papers */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Papers</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {stats?.totalPapers ?? papers.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">manuscripts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400">●</span> Synced with database
          </p>
        </div>

        {/* Generated Podcasts */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Generated Podcasts</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Mic className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {stats?.totalPodcasts ?? podcasts.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">episodes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-indigo-400 font-mono">Two-Voice</span> Narration
          </p>
        </div>

        {/* Total Listening Time */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Listening History</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {formatDuration(stats?.totalListeningTime ?? 172)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-purple-400">Audio playback</span> tracked
          </p>
        </div>

        {/* Average Rating */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Average Rating</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {stats?.averageRating ?? 4.9}
            </span>
            <span className="text-xs text-amber-400 font-medium">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            Based on clarity & fidelity
          </p>
        </div>

      </div>

      {/* Main Content Layout: Papers & Podcasts Grid + Recent Activity Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Research Papers */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Research Papers</h2>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              + Upload Paper
            </button>
          </div>

          {/* Paper Cards List */}
          {papers.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No research papers yet.</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Upload your first academic paper or test with a pre-formatted benchmark paper.
                </p>
              </div>

              {/* Quick Sample Seed Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleSeedSample('alphafold')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 hover:bg-cyan-900/50 transition-colors"
                >
                  ⚡ Load AlphaFold 2 Paper
                </button>
                <button
                  onClick={() => handleSeedSample('generative-agents')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900/50 transition-colors"
                >
                  ⚡ Load Generative Agents Paper
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/upload')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
                >
                  Upload Your Own PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {papers.map((paper) => {
                const associatedPodcast = podcasts.find(p => p.paperId === paper.id);

                return (
                  <div
                    key={paper.id}
                    className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {paper.fileName}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {new Date(paper.uploadedAt).toLocaleDateString()}
                          </span>
                          {associatedPodcast && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Podcast Ready ({formatDuration(associatedPodcast.duration)})
                            </span>
                          )}
                        </div>

                        <h3 
                          onClick={() => navigate(`/papers/${paper.id}`)}
                          className="text-base font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer leading-snug pt-1"
                        >
                          {paper.title}
                        </h3>

                        <p className="text-xs text-slate-400">
                          <strong>Authors:</strong> {paper.authors.join(', ')}
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                        {associatedPodcast ? (
                          <button
                            onClick={() => loadAndPlayPodcast(associatedPodcast)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-md transition-all hover:scale-105"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Listen</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGeneratePodcast(paper.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 hover:bg-indigo-900/60 transition-all hover:scale-105"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                            <span>Generate Podcast</span>
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/papers/${paper.id}`)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Paper Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeletePaper(paper.id, paper.title)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Paper"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Paper Abstract Excerpt */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                      {paper.abstract}
                    </p>

                    {/* Keywords tags */}
                    {paper.keywords && paper.keywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {paper.keywords.slice(0, 5).map((kw, i) => (
                          <span key={i} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Col: Podcasts & Activity Feed */}
        <div className="space-y-6">
          
          {/* Podcasts Quick Widget */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                Latest Podcasts ({podcasts.length})
              </h3>
              <button 
                onClick={() => navigate('/podcasts')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all
              </button>
            </div>

            {podcasts.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No podcasts generated yet.
              </p>
            ) : (
              <div className="space-y-3">
                {podcasts.slice(0, 3).map((pod) => (
                  <div
                    key={pod.id}
                    onClick={() => navigate(`/podcasts/${pod.id}`)}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                        {pod.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDuration(pod.duration)}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {pod.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {pod.paperTitle}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Timeline */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                Recent Activity
              </h3>
              <button 
                onClick={() => navigate('/history')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                History
              </button>
            </div>

            {(!stats?.recentActivities || stats.recentActivities.length === 0) ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Your activity timeline will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 font-medium truncate">{act.title}</p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Progress Modal */}
      <PipelineProgressModal
        progress={activeJobProgress}
        onClose={() => setActiveJobProgress(null)}
        onViewPodcast={(podcastId) => navigate(`/podcasts/${podcastId}`)}
        onListenPodcast={async (podcastId) => {
          try {
            const res = await api.getPodcastById(podcastId);
            if (res.podcast) {
              await loadAndPlayPodcast(res.podcast);
            }
          } catch (err) {
            console.error('Failed to auto-play podcast:', err);
          }
          navigate(`/podcasts/${podcastId}`);
        }}
      />

    </div>
  );
};
