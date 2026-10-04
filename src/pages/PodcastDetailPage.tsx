import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  Download, 
  Trash2, 
  RefreshCw, 
  Star, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  Mic, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  Volume2,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { Podcast } from '../types/index';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useToast } from '../context/ToastContext';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { EvaluationCard } from '../components/EvaluationCard';
import { RatingModal } from '../components/RatingModal';
import { downloadPodcastWavFile } from '../utils/audioGenerator';

interface PodcastDetailPageProps {
  podcastId: string;
  navigate: (path: string) => void;
}

export const PodcastDetailPage: React.FC<PodcastDetailPageProps> = ({ podcastId, navigate }) => {
  const { 
    currentPodcast, 
    isPlaying, 
    activeSegmentIndex, 
    loadAndPlayPodcast, 
    togglePlayPause, 
    seekToSegment,
    downloadAudioFile,
    downloadScriptFile 
  } = useAudioPlayer();
  const { showToast } = useToast();

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'evaluation' | 'details'>('script');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPodcast = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPodcastById(podcastId);
      setPodcast(res.podcast);
    } catch (err: any) {
      showToast('Error loading podcast: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcast();
  }, [podcastId]);

  useEffect(() => {
    if (podcast && (window.location.search.includes('autoplay=true') || window.location.hash.includes('play'))) {
      loadAndPlayPodcast(podcast);
    }
  }, [podcast]);

  const handleDownloadWavAudio = () => {
    if (!podcast) return;
    downloadPodcastWavFile(podcast);
    showToast('Podcast audio file (.wav) downloaded!', 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
          <Clock className="w-5 h-5 text-indigo-400 animate-spin" />
          <span>Loading podcast episode master...</span>
        </div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 text-center space-y-4">
        <p className="text-sm text-slate-400">Podcast episode not found.</p>
        <button
          onClick={() => navigate('/podcasts')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
        >
          View All Podcasts
        </button>
      </div>
    );
  }

  const isCurrentAudio = currentPodcast?.id === podcast.id;
  const isCurrentPlaying = isCurrentAudio && isPlaying;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${podcast.title}"?`)) return;
    try {
      await api.deletePodcast(podcast.id);
      showToast('Podcast deleted.', 'success');
      navigate('/podcasts');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete podcast', 'error');
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/podcasts')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Podcasts Library</span>
      </button>

      {/* Episode Header & Player Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 relative overflow-hidden">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Ready to Listen
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
              Duration: {formatDuration(podcast.duration)}
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Two Voices (Host & Researcher)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRatingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/30 hover:bg-amber-900/40 transition-colors"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{podcast.ratingAverage ? `${podcast.ratingAverage} / 5.0` : 'Rate Episode'}</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete Episode"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title and Paper Link */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {podcast.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
            <span>Based on:</span>
            <button
              onClick={() => navigate(`/papers/${podcast.paperId}`)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 truncate max-w-md text-left"
            >
              {podcast.paperTitle || 'Research Manuscript'}
            </button>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </p>
          {podcast.paperAuthors && (
            <p className="text-xs text-slate-500">
              Original Authors: {podcast.paperAuthors.join(', ')}
            </p>
          )}
        </div>

        {/* Big Audio Play Control Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => {
                if (isCurrentAudio) {
                  togglePlayPause();
                } else {
                  loadAndPlayPodcast(podcast);
                }
              }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              {isCurrentPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current pl-1" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {isCurrentPlaying ? 'Now Playing Live Audio' : 'Click to Play Episode'}
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dual-speaker narration with real-time synchronized transcript highlighting
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <WaveformVisualizer isPlaying={isCurrentPlaying} barCount={20} height={32} />

            <button
              onClick={handleDownloadWavAudio}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-cyan-600/20 transition-all hover:scale-105 active:scale-95"
              title="Download 16-Bit WAV Audio"
            >
              <Download className="w-4 h-4" />
              <span>Download Audio (.wav)</span>
            </button>

            <button
              onClick={downloadScriptFile}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
              title="Download Transcript"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Transcript (.txt)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Tabs: Synchronized Script, Factual Evaluation, Research Details */}
      <div className="border-b border-slate-800 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('script')}
          className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'script'
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Interactive Script ({podcast.segments?.length || 0} turns)</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluation')}
          className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'evaluation'
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>AI Factual Drift Evaluation</span>
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'details'
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Source Paper Details</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {activeTab === 'script' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Click on any dialogue turn to jump playback directly to that segment.</span>
              <span className="font-mono text-[11px] text-cyan-400">Synced Audio Pacing</span>
            </div>

            {podcast.segments && podcast.segments.length > 0 ? (
              <div className="space-y-3">
                {podcast.segments.map((seg, idx) => {
                  const isActive = isCurrentAudio && activeSegmentIndex === idx;

                  return (
                    <div
                      key={seg.id || idx}
                      onClick={() => {
                        if (!isCurrentAudio) {
                          loadAndPlayPodcast(podcast, idx);
                        } else {
                          seekToSegment(idx);
                        }
                      }}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10 text-white scale-[1.01]'
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                            seg.speaker === 'Host'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            <Mic className="w-3 h-3" />
                            {seg.speaker}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Turn {idx + 1} • ~{seg.duration}s
                          </span>
                        </div>

                        {isActive && (
                          <span className="text-[10px] font-mono text-cyan-400 font-semibold flex items-center gap-1 animate-pulse">
                            <Volume2 className="w-3.5 h-3.5" />
                            Speaking
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed font-sans">
                        {seg.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm font-mono whitespace-pre-wrap text-slate-300 leading-relaxed">
                {podcast.script}
              </div>
            )}
          </div>
        )}

        {activeTab === 'evaluation' && (
          <EvaluationCard evaluation={podcast.evaluation} />
        )}

        {activeTab === 'details' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Academic Paper Summary</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This podcast was generated from the academic manuscript "{podcast.paperTitle}". All empirical metrics, BLEU scores, sample sizes, and methodology were strictly preserved by the Gemini extraction engine.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate(`/papers/${podcast.paperId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
              >
                <span>Explore Full Section Breakdown</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Rating Modal */}
      <RatingModal
        podcastId={podcast.id}
        podcastTitle={podcast.title}
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onRatingSubmitted={fetchPodcast}
      />

    </div>
  );
};
