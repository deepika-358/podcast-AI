import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Podcast, PodcastSegment } from '../types/index';
import { api } from '../services/api';
import { downloadPodcastWavFile } from '../utils/audioGenerator';

interface AudioPlayerContextType {
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  activeSegmentIndex: number;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  loadAndPlayPodcast: (podcast: Podcast, startSegmentIndex?: number) => Promise<void>;
  togglePlayPause: () => void;
  seekToTime: (timeInSeconds: number) => void;
  seekToSegment: (segmentIndex: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  stopAudio: () => void;
  downloadAudioFile: () => void;
  downloadScriptFile: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRateState] = useState<number>(1);
  const [volume, setVolumeState] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSpeechSupported) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSpeechSupported]);

  // Voices loader
  useEffect(() => {
    if (!isSpeechSupported) return;
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [isSpeechSupported]);

  // Clean playback timer for progress tracking (advances smoothly with playbackRate)
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }, 1000 / playbackRate);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, playbackRate]);

  // Keep activeSegmentIndex in sync with currentTime
  useEffect(() => {
    if (currentPodcast?.segments && currentPodcast.segments.length > 0) {
      let accum = 0;
      for (let i = 0; i < currentPodcast.segments.length; i++) {
        accum += (currentPodcast.segments[i].duration || 6);
        if (currentTime < accum) {
          setActiveSegmentIndex(i);
          break;
        }
      }
    }
  }, [currentTime, currentPodcast]);

  // Pure, clean speech synthesis between the two speakers with ZERO background noise/music
  const speakSegment = (podcast: Podcast, index: number) => {
    if (!isSpeechSupported || !podcast.segments || index >= podcast.segments.length) {
      setIsPlaying(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const segment = podcast.segments[index];
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utteranceRef.current = utterance;

      // Clean voice differentiation between Host & Researcher
      if (voices.length > 0) {
        if (segment.speaker === 'Host') {
          const maleVoice = voices.find(v => 
            (v.name.toLowerCase().includes('david') || 
             v.name.toLowerCase().includes('male') || 
             v.name.toLowerCase().includes('guy') || 
             v.name.toLowerCase().includes('google us') ||
             v.name.toLowerCase().includes('daniel') ||
             v.name.toLowerCase().includes('english')) && v.lang.startsWith('en')
          );
          if (maleVoice) utterance.voice = maleVoice;
          utterance.pitch = 1.05;
          utterance.rate = 1.02 * playbackRate;
        } else {
          const femaleVoice = voices.find(v => 
            (v.name.toLowerCase().includes('samantha') || 
             v.name.toLowerCase().includes('zira') || 
             v.name.toLowerCase().includes('female') || 
             v.name.toLowerCase().includes('victoria') || 
             v.name.toLowerCase().includes('aria') ||
             v.name.toLowerCase().includes('karen')) && v.lang.startsWith('en')
          );
          if (femaleVoice) utterance.voice = femaleVoice;
          utterance.pitch = 0.96;
          utterance.rate = 0.98 * playbackRate;
        }
      } else {
        utterance.rate = playbackRate;
        utterance.pitch = segment.speaker === 'Host' ? 1.08 : 0.96;
      }

      utterance.volume = isMuted ? 0 : volume;

      utterance.onend = () => {
        const nextIndex = index + 1;
        if (nextIndex < (podcast.segments?.length || 0)) {
          setActiveSegmentIndex(nextIndex);
          // Pure, silent natural pause between turns (350ms) - completely clean with zero background noise
          setTimeout(() => {
            speakSegment(podcast, nextIndex);
          }, 350 / playbackRate);
        } else {
          setIsPlaying(false);
          setActiveSegmentIndex(0);
          setCurrentTime(podcast.duration);
          api.recordListen(podcast.id, 100).catch(console.error);
        }
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis turn notice:', e);
      };

      // Slight 40ms dispatch delay to ensure clean utterance lifecycle in Chrome
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 40);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  const loadAndPlayPodcast = async (podcast: Podcast, startSegmentIndex: number = 0) => {
    let fullPodcast = podcast;

    // Ensure segments are loaded if caller only passed partial podcast object
    if (!fullPodcast.segments || fullPodcast.segments.length === 0) {
      try {
        const res = await api.getPodcastById(podcast.id);
        if (res.podcast) {
          fullPodcast = res.podcast;
        }
      } catch (err) {
        console.warn('Could not fetch podcast segments:', err);
      }
    }

    // Fallback default segments if paper script was raw
    if (!fullPodcast.segments || fullPodcast.segments.length === 0) {
      const parts = fullPodcast.script.split(/\n\n+/).filter(Boolean);
      fullPodcast.segments = parts.map((p, idx) => ({
        id: 'seg_' + idx,
        podcastId: fullPodcast.id,
        speaker: p.toLowerCase().startsWith('host') ? 'Host' : 'Researcher',
        text: p.replace(/^(HOST|RESEARCHER):?\s*/i, ''),
        duration: Math.max(5, Math.round(p.split(' ').length / 2.3)),
        sequence: idx,
      }));
    }

    setCurrentPodcast(fullPodcast);
    const totalDur = fullPodcast.duration || 180;
    setDuration(totalDur);
    setActiveSegmentIndex(startSegmentIndex);

    // Calculate current time up to startSegmentIndex
    let elapsed = 0;
    if (fullPodcast.segments) {
      for (let i = 0; i < startSegmentIndex; i++) {
        elapsed += fullPodcast.segments[i].duration;
      }
    }
    setCurrentTime(elapsed);
    setIsPlaying(true);

    // Play purely clean speech synthesis - NO background audio track or music noise!
    if (isSpeechSupported) {
      speakSegment(fullPodcast, startSegmentIndex);
    }
  };

  const togglePlayPause = () => {
    if (!currentPodcast) return;

    if (isPlaying) {
      setIsPlaying(false);
      if (isSpeechSupported) {
        window.speechSynthesis.pause();
      }
    } else {
      setIsPlaying(true);
      if (isSpeechSupported) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          speakSegment(currentPodcast, activeSegmentIndex);
        }
      }
    }
  };

  const seekToSegment = (segmentIndex: number) => {
    if (!currentPodcast || !currentPodcast.segments) return;
    const clamped = Math.max(0, Math.min(segmentIndex, currentPodcast.segments.length - 1));
    setActiveSegmentIndex(clamped);

    let elapsed = 0;
    for (let i = 0; i < clamped; i++) {
      elapsed += currentPodcast.segments[i].duration;
    }
    setCurrentTime(elapsed);

    if (isPlaying && isSpeechSupported) {
      speakSegment(currentPodcast, clamped);
    }
  };

  const seekToTime = (timeInSeconds: number) => {
    if (!currentPodcast || !currentPodcast.segments) return;
    const clampedTime = Math.max(0, Math.min(timeInSeconds, duration));
    setCurrentTime(clampedTime);

    let accum = 0;
    let targetIdx = 0;
    for (let i = 0; i < currentPodcast.segments.length; i++) {
      accum += currentPodcast.segments[i].duration;
      if (clampedTime <= accum) {
        targetIdx = i;
        break;
      }
    }
    setActiveSegmentIndex(targetIdx);

    if (isPlaying && isSpeechSupported) {
      speakSegment(currentPodcast, targetIdx);
    }
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    if (isPlaying && currentPodcast && isSpeechSupported) {
      speakSegment(currentPodcast, activeSegmentIndex);
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);

    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 0 : val;
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const stopAudio = () => {
    setIsPlaying(false);
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
    }
    setCurrentTime(0);
    setActiveSegmentIndex(0);
  };

  const downloadAudioFile = () => {
    if (!currentPodcast) return;
    downloadPodcastWavFile(currentPodcast);
  };

  const downloadScriptFile = () => {
    if (!currentPodcast) return;
    const element = document.createElement('a');
    const file = new Blob([currentPodcast.script], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentPodcast.title.replace(/[^a-z0-9]/gi, '_')}_transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentPodcast,
        isPlaying,
        activeSegmentIndex,
        currentTime,
        duration,
        playbackRate,
        volume,
        isMuted,
        loadAndPlayPodcast,
        togglePlayPause,
        seekToTime,
        seekToSegment,
        setPlaybackRate,
        setVolume,
        toggleMute,
        stopAudio,
        downloadAudioFile,
        downloadScriptFile,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
