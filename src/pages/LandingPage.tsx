import React from 'react';
import { 
  Headphones, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Mic, 
  Search, 
  History, 
  Star, 
  Users, 
  Volume2,
  BookOpen,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { WaveformVisualizer } from '../components/WaveformVisualizer';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { user, demoLogin } = useAuth();
  const { loadAndPlayPodcast, isPlaying, currentPodcast } = useAudioPlayer();

  const handleStart = () => {
    if (user) navigate('/upload');
    else navigate('/register');
  };

  const sampleDemoPodcast = {
    id: 'pod_attention_2017',
    userId: 'usr_demo_academic',
    paperId: 'paper_attention_2017',
    title: 'Attention Is All You Need: The Breakthrough That Changed AI Forever',
    paperTitle: 'Attention Is All You Need: The Transformer Architecture',
    script: `HOST: Welcome to PaperCast AI! Today we're exploring Vaswani et al.'s landmark paper that replaced RNNs with pure self-attention.\n\nRESEARCHER: The core breakthrough was ditching sequential computation entirely, achieving 28.4 BLEU score on English-German translation while training in just 12 hours on eight GPUs.`,
    duration: 172,
    status: 'completed' as const,
    createdAt: new Date().toISOString(),
    segments: [
      {
        id: 's1',
        podcastId: 'pod_attention_2017',
        speaker: 'Host' as const,
        text: "Welcome to PaperCast AI! Today we're exploring Vaswani et al.'s landmark paper: Attention Is All You Need.",
        sequence: 0,
        duration: 8
      },
      {
        id: 's2',
        podcastId: 'pod_attention_2017',
        speaker: 'Researcher' as const,
        text: "The core breakthrough was ditching sequential computation entirely, reaching 28.4 BLEU on English-to-German while training in just 12 hours on eight GPUs.",
        sequence: 1,
        duration: 14
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-lg shadow-indigo-500/10 hover:border-indigo-500/60 transition-all">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI-Powered Research Audio</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Zero Hallucination Factual Audit</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Your Research Paper. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Now in Conversation.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            PaperCast AI transforms complex academic research into clear, engaging AI-powered podcasts — so you can understand more while listening.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5 text-cyan-200" />
              <span>Create Your Podcast</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-base text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all"
            >
              <span>Explore How It Works</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
              <p className="text-xl font-bold text-white font-mono">PDF → Audio</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated Extraction</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
              <p className="text-xl font-bold text-indigo-400 font-mono">96%+</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Factual Accuracy</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
              <p className="text-xl font-bold text-cyan-400 font-mono">Two Voices</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Host & Researcher</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
              <p className="text-xl font-bold text-purple-400 font-mono">0 Fake Claims</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Strict Audit Engine</p>
            </div>
          </div>

        </div>

        {/* Futuristic Animated Visual: PDF -> AI Nodes -> Podcast Waveform */}
        <div className="mt-16 relative max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-slate-900/80 border border-slate-700/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden">
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              
              {/* Paper Card */}
              <div className="flex-1 w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    ACADEMIC PDF INPUT
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">2.2 MB</span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">
                  Attention Is All You Need (Vaswani et al.)
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  "We propose the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely..."
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sections Extracted: Abstract, Methods, BLEU Results</span>
                </div>
              </div>

              {/* Central AI Transformation Node */}
              <div className="flex flex-col items-center justify-center shrink-0 space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-xl shadow-indigo-500/30 animate-pulse">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-cyan-300" />
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  Gemini Pipeline
                </span>
              </div>

              {/* Output Podcast Player Preview */}
              <div className="flex-1 w-full p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
                    <Headphones className="w-4 h-4 text-cyan-400" />
                    TWO-VOICE PODCAST
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">Ready</span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">
                  The Breakthrough That Changed AI Forever
                </h4>
                
                {/* Dialogue Preview */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                  <p className="text-slate-300">
                    <strong className="text-indigo-400 font-mono">HOST:</strong> How did the authors solve the RNN bottleneck?
                  </p>
                  <p className="text-slate-300">
                    <strong className="text-cyan-400 font-mono">RESEARCHER:</strong> With Self-Attention! Every word attends to all tokens simultaneously.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <WaveformVisualizer isPlaying={isPlaying && currentPodcast?.id === 'pod_attention_2017'} barCount={16} height={20} />
                  <button
                    onClick={() => loadAndPlayPodcast(sampleDemoPodcast)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Demo Sample</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              4-Step Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Complex PDF to Clear Audio
            </h2>
            <p className="text-sm text-slate-400">
              Our end-to-end scientific pipeline decomposes dense research papers into natural acoustic discourse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/80 relative hover:border-indigo-500/40 transition-all group">
              <span className="text-3xl font-extrabold font-mono text-slate-700 group-hover:text-indigo-400 transition-colors">01</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center my-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Upload Research Paper</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag and drop your academic PDF from ArXiv, Nature, IEEE, or PubMed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/80 relative hover:border-indigo-500/40 transition-all group">
              <span className="text-3xl font-extrabold font-mono text-slate-700 group-hover:text-indigo-400 transition-colors">02</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center my-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI Understands</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini extracts Abstract, Methodology, Empirical Results, and isolates exact benchmark figures.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/80 relative hover:border-indigo-500/40 transition-all group">
              <span className="text-3xl font-extrabold font-mono text-slate-700 group-hover:text-indigo-400 transition-colors">03</span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center my-4">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Generate Podcast</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Findings are written into a natural dialogue between Host and Researcher, synthesized with distinct voices.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/80 relative hover:border-indigo-500/40 transition-all group">
              <span className="text-3xl font-extrabold font-mono text-slate-700 group-hover:text-indigo-400 transition-colors">04</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center my-4">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Listen & Learn</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enjoy speed controls, synchronous script highlight, factual drift evaluation, and full downloadable audio.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Engineered For Academia
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Features Built For Deep Research
          </h2>
          <p className="text-sm text-slate-400">
            Every feature is designed to protect scientific nuance while maximizing comprehension.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 w-fit mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Smart PDF Processing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts high-resolution text, mathematical formulas, and table references directly from raw research PDFs.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Section Summarization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deconstructs Abstract, Methodology, Results, and Limitations while preserving numerical statistics and sample counts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Conversational Screenplay</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates lively banter between an inquisitive science journalist (Host) and an articulate specialist (Researcher).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Factual Drift Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI verification engine compares generated dialogue back to source sections, detecting unsupported claims or changed figures.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 w-fit mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Two-Voice Narration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Realistic speech generation with distinct pitch and cadence, coupled with realistic conversational turn pauses.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Database Search</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real server-side database querying across paper titles, author names, keywords, and full podcast transcripts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit mb-4">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Research History</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audit timeline categorized by Today, Yesterday, and Earlier tracking uploads, listens, ratings, and queries.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 w-fit mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Ratings & Feedback</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluate episodes on Clarity, Scientific Accuracy, and Usefulness with community averages and feedback notes.
            </p>
          </div>

        </div>
      </section>

      {/* About / Academic Ethics Banner */}
      <section id="about" className="py-20 bg-slate-900/30 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            <Award className="w-4 h-4 text-cyan-400" />
            Academic Integrity Protocol
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built On a Strict Zero-Hallucination Standard
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Unlike general chat tools that may invent references or inflate claims, PaperCast AI enforces source verification: only claims supported directly by the uploaded manuscript are spoken. Missing sections are clearly noted rather than invented.
          </p>

          <div className="pt-6">
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-xl shadow-indigo-600/25 transition-all"
            >
              <span>Get Started With Your Paper</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
