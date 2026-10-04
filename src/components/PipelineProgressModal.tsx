import React from 'react';
import { 
  FileUp, 
  FileText, 
  Layers, 
  Sparkles, 
  MessageSquare, 
  Mic, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Play,
  Download
} from 'lucide-react';
import { PipelineProgress } from '../types/index';
import { api } from '../services/api';
import { downloadPodcastWavFile } from '../utils/audioGenerator';

interface PipelineProgressModalProps {
  progress: PipelineProgress | null;
  onClose: () => void;
  onViewPodcast: (podcastId: string) => void;
  onListenPodcast?: (podcastId: string) => void;
}

const STAGES = [
  { step: 1, name: 'Uploading PDF', desc: 'Securely uploading document buffer', icon: FileUp },
  { step: 2, name: 'Extracting Text', desc: 'Parsing academic typography & formulas', icon: FileText },
  { step: 3, name: 'Detecting Sections', desc: 'Mapping Abstract, Methods, Results & Discussion', icon: Layers },
  { step: 4, name: 'Summarizing Research', desc: 'Preserving exact numbers and statistics', icon: Sparkles },
  { step: 5, name: 'Creating Podcast Script', desc: 'Generating Host & Researcher dialogue turns', icon: MessageSquare },
  { step: 6, name: 'Generating Audio', desc: 'Synthesizing two-voice narration with natural pauses', icon: Mic },
  { step: 7, name: 'Finalizing & Evaluating', desc: 'Auditing factual fidelity & packaging podcast', icon: CheckCircle2 },
];

export const PipelineProgressModal: React.FC<PipelineProgressModalProps> = ({
  progress,
  onClose,
  onViewPodcast,
  onListenPodcast,
}) => {
  if (!progress) return null;

  const currentStep = progress.step || 1;
  const isDone = progress.status === 'completed';
  const isFailed = progress.status === 'failed';

  const handleDownloadDirectly = async () => {
    try {
      const res = await api.getPodcastById(progress.podcastId);
      if (res.podcast) {
        downloadPodcastWavFile(res.podcast);
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 overflow-hidden relative">
        
        {/* Glow behind modal */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-indigo-500/20 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              {isDone ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce" />
              ) : isFailed ? (
                <AlertCircle className="w-7 h-7 text-rose-400" />
              ) : (
                <Mic className="w-7 h-7 text-indigo-400 animate-pulse" />
              )}
            </div>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {isDone ? 'Podcast Completed & Ready!' : isFailed ? 'Generation Encountered an Issue' : 'AI Podcast Pipeline in Progress'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isDone 
              ? 'Your two-voice academic podcast is synthesized and ready to play or download.' 
              : progress.message || 'Transforming academic research into an engaging conversational audio episode.'}
          </p>
        </div>

        {/* Stages List */}
        <div className="space-y-3 mb-6 relative max-h-72 overflow-y-auto pr-1">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const isPassed = currentStep > stage.step || isDone;
            const isCurrent = currentStep === stage.step && !isDone && !isFailed;

            return (
              <div
                key={stage.step}
                className={`flex items-center gap-3.5 p-2.5 rounded-xl border transition-all duration-300 ${
                  isPassed
                    ? 'bg-slate-950/40 border-emerald-500/20 text-slate-300'
                    : isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/20 border-slate-800/40 text-slate-500 opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isPassed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{stage.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-cyan-400 font-medium animate-pulse">
                        In Progress...
                      </span>
                    )}
                    {isPassed && (
                      <span className="text-[10px] font-mono text-emerald-400 font-medium">
                        Complete ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bottom */}
        <div className="pt-4 border-t border-slate-800">
          {!isDone && !isFailed ? (
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                Step {currentStep} of 7
              </span>
              <span className="text-[11px] text-slate-500">Do not refresh browser window</span>
            </div>
          ) : isDone ? (
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  onClose();
                  if (onListenPodcast) {
                    onListenPodcast(progress.podcastId);
                  } else {
                    onViewPodcast(progress.podcastId);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-indigo-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Listen & Play Audio Now</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadDirectly}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 hover:bg-cyan-900/60 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Audio (.wav)</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onViewPodcast(progress.podcastId);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Full Script</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
