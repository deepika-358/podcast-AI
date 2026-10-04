import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  FileCheck, 
  HelpCircle 
} from 'lucide-react';
import { Evaluation, DetectedIssue } from '../types/index';

interface EvaluationCardProps {
  evaluation?: Evaluation;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({ evaluation }) => {
  if (!evaluation) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
        <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-300">Factual evaluation not available for this episode.</p>
      </div>
    );
  }

  const { factualAccuracyScore, clarityScore, unsupportedClaims, detectedIssues, evaluationSummary } = evaluation;

  return (
    <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-xl backdrop-blur-xl space-y-6">
      
      {/* Header & Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              AI Factual Drift Evaluation
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI-Assisted Audit
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Cross-checked against extracted research sections and empirical benchmarks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Evaluation is AI-assisted; consult source PDF for clinical or mission-critical verification.</span>
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Factual Accuracy */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Factual Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {factualAccuracyScore}%
            </span>
            <span className="text-xs font-medium text-emerald-400">High Fidelity</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${factualAccuracyScore}%` }}
            />
          </div>
        </div>

        {/* Clarity Score */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Dialogue Clarity</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {clarityScore}%
            </span>
            <span className="text-xs font-medium text-cyan-400">Accessible</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${clarityScore}%` }}
            />
          </div>
        </div>

        {/* Unsupported Claims */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Unsupported Claims</span>
            <AlertTriangle className={`w-4 h-4 ${unsupportedClaims === 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {unsupportedClaims}
            </span>
            <span className={`text-xs font-medium ${unsupportedClaims === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {unsupportedClaims === 0 ? 'Zero Detected' : 'Requires Review'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${unsupportedClaims === 0 ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: unsupportedClaims === 0 ? '100%' : `${Math.max(15, 100 - unsupportedClaims * 30)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Summary Narrative */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1.5 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-indigo-400" />
          Reviewer Audit Verdict
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          "{evaluationSummary}"
        </p>
      </div>

      {/* Detected Claims Audit Breakdown */}
      {detectedIssues && detectedIssues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            Claim-by-Claim Verification Audit ({detectedIssues.length})
          </h4>
          <div className="space-y-2.5">
            {detectedIssues.map((issue: DetectedIssue, idx: number) => {
              const isVerified = issue.type === 'verified_accurate';
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    isVerified
                      ? 'bg-slate-950/40 border-emerald-500/20 text-slate-300'
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      {isVerified ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Script Excerpt: "{issue.quote}"</span>
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                      isVerified
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {issue.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-slate-400 mb-1">
                    <strong className="text-slate-300">Source Grounding:</strong> {issue.sourceContext}
                  </p>
                  <p className="text-slate-300 italic">
                    {issue.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
