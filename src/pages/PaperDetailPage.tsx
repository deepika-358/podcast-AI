import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ArrowLeft, 
  Mic, 
  Calendar, 
  User, 
  FileText, 
  Sparkles, 
  Play, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Download,
  Share2
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchPaper, Podcast } from '../types/index';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useToast } from '../context/ToastContext';

interface PaperDetailPageProps {
  paperId: string;
  navigate: (path: string) => void;
}

export const PaperDetailPage: React.FC<PaperDetailPageProps> = ({ paperId, navigate }) => {
  const { loadAndPlayPodcast } = useAudioPlayer();
  const { showToast } = useToast();

  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [associatedPodcast, setAssociatedPodcast] = useState<Podcast | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [paperRes, podcastsRes] = await Promise.all([
          api.getPaperById(paperId),
          api.getPodcasts(),
        ]);
        setPaper(paperRes.paper);
        const match = podcastsRes.podcasts.find(p => p.paperId === paperId);
        if (match) setAssociatedPodcast(match);
      } catch (err: any) {
        showToast('Error loading paper: ' + err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [paperId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
          <Clock className="w-5 h-5 text-indigo-400 animate-spin" />
          <span>Loading academic manuscript sections...</span>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 text-center space-y-4">
        <p className="text-sm text-slate-400">Research paper not found.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const sections = paper.sections || [];
  const sectionTabs = [
    { id: 'overview', label: 'Overview' },
    ...sections.map(s => ({
      id: s.sectionName,
      label: s.sectionName.charAt(0).toUpperCase() + s.sectionName.slice(1),
    }))
  ];

  const currentSectionData = sections.find(s => s.sectionName.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Paper Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 relative overflow-hidden">
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {paper.fileName}
          </span>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {paper.publicationDate || new Date(paper.uploadedAt).toLocaleDateString()}
          </span>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Sections Analyzed ({sections.length})
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          {paper.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <User className="w-4 h-4 text-slate-500 shrink-0" />
          <span><strong>Authors:</strong> {paper.authors.join(', ')}</span>
        </div>

        {/* Podcast CTA Banner inside Header */}
        <div className="pt-2">
          {associatedPodcast ? (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  Generated AI Podcast Episode Ready
                </span>
                <p className="text-xs font-semibold text-white truncate max-w-md">
                  {associatedPodcast.title}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadAndPlayPodcast(associatedPodcast)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-md transition-all hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Podcast</span>
                </button>
                <button
                  onClick={() => navigate(`/podcasts/${associatedPodcast.id}`)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
                >
                  View Script & Audio
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                Turn this research paper into a conversational two-speaker podcast.
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Generate Podcast</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-1 overflow-x-auto pb-1">
        {sectionTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6">
        
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                Abstract Summary
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {paper.abstract}
              </p>
            </div>

            {/* Keyword tags */}
            {paper.keywords && paper.keywords.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Research Keywords & Taxonomy
                </h4>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section Index Summary */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Extracted Sections Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    onClick={() => setActiveTab(sec.sectionName)}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors capitalize">
                        {sec.sectionName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Section {idx + 1}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {sec.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {currentSectionData ? (
              <>
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Factual Synthesis
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {currentSectionData.summary}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Source Paper Transcript
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {currentSectionData.originalText}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">Section content not specified in source document.</p>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
