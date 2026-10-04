import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  Upload, 
  FileText, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { api } from '../services/api';
import { PipelineProgressModal } from '../components/PipelineProgressModal';
import { PipelineProgress } from '../types/index';

interface UploadPaperPageProps {
  navigate: (path: string) => void;
}

export const UploadPaperPage: React.FC<UploadPaperPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { loadAndPlayPodcast } = useAudioPlayer();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [inputMode, setInputMode] = useState<'pdf' | 'text'>('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Pipeline modal state
  const [activeJobProgress, setActiveJobProgress] = useState<PipelineProgress | null>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF file. Other file formats are not supported.');
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB maximum limit. Please upload a smaller research paper.');
      return;
    }

    setFile(selectedFile);
    if (!manualTitle) {
      const cleanTitle = selectedFile.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setManualTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    }

    // Convert to Base64 for server delivery
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setFileBase64(base64Data);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyzeAndGenerate = async () => {
    setError(null);
    if (inputMode === 'pdf' && !file) {
      setError('Please select or drop a research paper PDF.');
      return;
    }
    if (inputMode === 'text' && !rawText.trim()) {
      setError('Please enter or paste the academic paper text or abstract.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    try {
      showToast('Uploading and parsing research paper...', 'info');
      setUploadProgress(50);

      const uploadRes = await api.uploadPaper({
        rawText: inputMode === 'text' ? rawText : undefined,
        pdfBase64: inputMode === 'pdf' ? (fileBase64 || undefined) : undefined,
        fileName: file ? file.name : `${(manualTitle || 'research_paper').slice(0, 30)}.pdf`,
        fileSize: file ? file.size : rawText.length,
        manualTitle: manualTitle.trim() || undefined,
      });

      setUploadProgress(100);
      showToast('Paper analyzed! Triggering podcast generation pipeline...', 'success');

      // Trigger podcast generation
      const genRes = await api.generatePodcast(uploadRes.paper.id);

      // Open pipeline modal immediately and start polling
      setActiveJobProgress({
        jobId: genRes.jobId,
        podcastId: genRes.podcastId,
        paperId: uploadRes.paper.id,
        status: 'processing',
        step: 1,
        totalSteps: 7,
        message: 'Uploading document buffer and parsing typography...',
      });

      const pollInterval = setInterval(async () => {
        try {
          const jobRes = await api.getJobProgress(genRes.jobId);
          setActiveJobProgress(jobRes.job);

          if (jobRes.job.status === 'completed' || jobRes.job.status === 'failed') {
            clearInterval(pollInterval);
          }
        } catch {
          clearInterval(pollInterval);
        }
      }, 700);

    } catch (err: any) {
      setError(err.message || 'Failed to process and analyze paper.');
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = async (sampleType: 'alphafold' | 'generative-agents') => {
    try {
      showToast('Loading pre-verified academic sample...', 'info');
      const res = await api.seedSamplePaper(sampleType);
      showToast('Sample loaded! Launching podcast generation...', 'success');

      const genRes = await api.generatePodcast(res.paper.id);
      
      setActiveJobProgress({
        jobId: genRes.jobId,
        podcastId: genRes.podcastId,
        paperId: res.paper.id,
        status: 'processing',
        step: 1,
        totalSteps: 7,
        message: 'Uploading document buffer and parsing typography...',
      });

      const pollInterval = setInterval(async () => {
        try {
          const jobRes = await api.getJobProgress(genRes.jobId);
          setActiveJobProgress(jobRes.job);

          if (jobRes.job.status === 'completed' || jobRes.job.status === 'failed') {
            clearInterval(pollInterval);
          }
        } catch {
          clearInterval(pollInterval);
        }
      }, 700);
    } catch (err: any) {
      showToast('Failed to load sample: ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          AI Podcast Studio
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Upload Your Research Paper
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Upload an academic research paper and transform it into an engaging AI podcast with verified factual fidelity.
        </p>
      </div>

      {/* 1-Click Pre-Vetted Benchmark Papers */}
      <div className="p-4 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Don't have a PDF ready?
          </h4>
          <p className="text-[11px] text-slate-400">
            Instantly load real peer-reviewed scientific breakthroughs with 1 click:
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLoadSample('alphafold')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 hover:bg-cyan-900/50 transition-colors"
          >
            AlphaFold 2 (Biology)
          </button>
          <button
            onClick={() => handleLoadSample('generative-agents')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900/50 transition-colors"
          >
            Generative Agents (AI)
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-center">
        <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 inline-flex">
          <button
            onClick={() => setInputMode('pdf')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              inputMode === 'pdf'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload PDF Document
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              inputMode === 'text'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paste Paper Text / Abstract
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Upload Error</p>
            <p className="text-slate-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Upload Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
        
        {inputMode === 'pdf' ? (
          <div>
            {!file ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/70 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  Drag & Drop Research PDF Here
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  or <span className="text-indigo-400 font-semibold underline underline-offset-4">browse files</span> on your computer
                </p>

                <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                  <span>Supported format: PDF only</span>
                  <span>•</span>
                  <span>Max file size: 25MB</span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-sm">{file.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRemoveFile}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-colors"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Paste Research Text (Abstract, Introduction, Results, Conclusion)
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full paper text or abstract here. PaperCast AI will segment and extract key findings..."
              rows={10}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
            />
          </div>
        )}

        {/* Paper Title Customizer */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Paper Title / Topic (Optional override)
          </label>
          <input
            type="text"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            placeholder="e.g. Scaled Self-Attention and Neural Translation Quality"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleAnalyzeAndGenerate}
            disabled={isUploading || (inputMode === 'pdf' && !file) || (inputMode === 'text' && !rawText.trim())}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-xl shadow-indigo-600/30 disabled:opacity-40 transition-all hover:scale-[1.01]"
          >
            <Sparkles className="w-5 h-5 text-cyan-200" />
            <span>{isUploading ? 'Analyzing Paper & Launching Pipeline...' : 'Analyze Research & Generate Podcast'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Academic Ethics Disclaimer */}
        <div className="flex items-center gap-2 text-xs text-slate-400 p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Zero Hallucination Guarantee: Extracted summaries will only preserve factual empirical numbers, sample sizes, and author-verified benchmarks.
          </span>
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
