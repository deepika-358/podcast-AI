import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  X, 
  Mic, 
  UserCheck, 
  FastForward, 
  Download,
  ListMusic
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { WaveformVisualizer } from './WaveformVisualizer';

interface GlobalAudioPlayerProps {
  navigate: (path: string) => void;
}

export const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({ navigate }) => {
  const {
    currentPodcast,
    isPlaying,
    activeSegmentIndex,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    togglePlayPause,
    seekToTime,
    seekToSegment,
    setPlaybackRate,
    setVolume,
    toggleMute,
    stopAudio,
    downloadAudioFile,
  } = useAudioPlayer();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showMiniTranscript, setShowMiniTranscript] = useState(false);

  if (!currentPodcast) return null;

  const currentSegment = currentPodcast.segments?.[activeSegmentIndex];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    seekToTime(newTime);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 sm:px-6 pb-3 pt-1 pointer-events-none">
      <div className="max-w-6xl mx-auto pointer-events-auto">
        
        {/* Mini Transcript Drawer */}
        {showMiniTranscript && currentPodcast.segments && (
          <div className="mb-2 p-4 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl max-h-64 overflow-y-auto space-y-2 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ListMusic className="w-4 h-4 text-indigo-400" />
                Live Podcast Script ({currentPodcast.segments.length} turns)
              </span>
              <button 
                onClick={() => setShowMiniTranscript(false)}
                className="hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {currentPodcast.segments.map((seg, idx) => (
              <div
                key={seg.id || idx}
                onClick={() => seekToSegment(idx)}
                className={`p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                  idx === activeSegmentIndex
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-md'
                    : 'hover:bg-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    seg.speaker === 'Host'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {seg.speaker}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">~{seg.duration}s</span>
                </div>
                <p className="leading-relaxed line-clamp-2">{seg.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main Floating Audio Bar */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl">
          
          {/* Top Info & Progress Bar */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 group">
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercent || 0}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
              />
              <div 
                className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 rounded-lg pointer-events-none group-hover:h-2 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400 w-10 shrink-0">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Podcast Meta & Active Speaker */}
            <div className="flex items-center gap-3 min-w-0 max-w-[35%]">
              <div className="hidden sm:block shrink-0">
                <WaveformVisualizer isPlaying={isPlaying} barCount={18} height={28} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 
                    onClick={() => navigate(`/podcasts/${currentPodcast.id}`)}
                    className="text-xs sm:text-sm font-semibold text-white truncate cursor-pointer hover:text-indigo-300 transition-colors"
                  >
                    {currentPodcast.title}
                  </h4>
                  {currentSegment && (
                    <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono shrink-0 ${
                      currentSegment.speaker === 'Host'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      <Mic className="w-2.5 h-2.5" />
                      {currentSegment.speaker}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentPodcast.paperTitle || 'Academic Research Podcast'}
                </p>
              </div>
            </div>

            {/* Center Controls: Skip, Play/Pause, Next */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => seekToSegment(Math.max(0, activeSegmentIndex - 1))}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                title="Previous Turn"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlayPause}
                className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current pl-0.5" />}
              </button>

              <button
                onClick={() => {
                  const maxIdx = (currentPodcast.segments?.length || 1) - 1;
                  seekToSegment(Math.min(maxIdx, activeSegmentIndex + 1));
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                title="Next Turn"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Tools & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Speed Button */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(prev => !prev)}
                  className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  {playbackRate}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-10 right-0 p-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col gap-0.5 z-50">
                    {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate);
                          setShowSpeedMenu(false);
                        }}
                        className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                          playbackRate === rate ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggle Live Script */}
              <button
                onClick={() => setShowMiniTranscript(prev => !prev)}
                className={`p-1.5 rounded-lg border transition-all ${
                  showMiniTranscript 
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                    : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Live Transcript"
              >
                <ListMusic className="w-4 h-4" />
              </button>

              {/* Volume Slider (hidden on extra small) */}
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  className="text-slate-400 hover:text-white p-1"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Download Audio */}
              <button
                onClick={downloadAudioFile}
                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                title="Download Podcast Audio (.wav)"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Expand to detail page */}
              <button
                onClick={() => navigate(`/podcasts/${currentPodcast.id}`)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Open Episode Detail"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Close audio player */}
              <button
                onClick={stopAudio}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Close Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
