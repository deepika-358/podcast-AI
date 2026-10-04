import React from 'react';
import { Headphones, ShieldCheck, Cpu, Sparkles, BookOpen, Heart } from 'lucide-react';

export const Footer: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">PaperCast AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transforming complex academic research papers into engaging, two-voice AI podcasts with verified factual fidelity.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400/90 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pipeline Engine: Gemini 3.8 Flash</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/upload')} className="hover:text-white transition-colors">
                  Upload Research Paper
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/podcasts')} className="hover:text-white transition-colors">
                  Podcast Library
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/search')} className="hover:text-white transition-colors">
                  Research Search
                </button>
              </li>
            </ul>
          </div>

          {/* AI Features */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">Core Pipeline</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>PDF Section Detection</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Empirical Summarization</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Two-Speaker Screenplay</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Factual Drift Auditing</span>
              </li>
            </ul>
          </div>

          {/* Academic Integrity */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">Academic Ethics</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              PaperCast AI adheres to strict academic anti-hallucination policies. All audio claims are linked directly to source paper methodology and experimental tables.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="font-semibold text-indigo-400">Zero Hallucination Rule:</span> Numerical figures and citations are never invented.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PaperCast AI. Designed for Academic Researchers & Students worldwide.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for scientific knowledge dissemination.
          </p>
        </div>
      </div>
    </footer>
  );
};
