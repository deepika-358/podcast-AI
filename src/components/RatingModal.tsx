import React, { useState } from 'react';
import { Star, X, MessageSquare, Send, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface RatingModalProps {
  podcastId: string;
  podcastTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  podcastId,
  podcastTitle,
  isOpen,
  onClose,
  onRatingSubmitted,
}) => {
  const { showToast } = useToast();
  const [clarityScore, setClarityScore] = useState(5);
  const [accuracyScore, setAccuracyScore] = useState(5);
  const [usefulnessScore, setUsefulnessScore] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const overall = Math.round((clarityScore + accuracyScore + usefulnessScore) / 3);
      await api.submitRating({
        podcastId,
        clarityScore,
        accuracyScore,
        usefulnessScore,
        overallScore: overall,
        feedback,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      showToast('Thank you for rating this podcast breakdown!', 'success');
      onRatingSubmitted();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit rating', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (value: number, setValue: (val: number) => void) => {
    return (
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setValue(star)}
            className="p-1 text-slate-600 hover:text-amber-400 focus:outline-none transition-colors"
          >
            <Star
              className={`w-6 h-6 transition-all ${
                star <= value ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-700'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Rate Podcast Breakdown</h3>
          <p className="text-xs text-slate-400 mt-1 truncate">"{podcastTitle}"</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Clarity */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200">Clarity of Narration</span>
              <p className="text-[11px] text-slate-400">Pacing and conversational ease</p>
            </div>
            {renderStars(clarityScore, setClarityScore)}
          </div>

          {/* Accuracy */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200">Scientific Accuracy</span>
              <p className="text-[11px] text-slate-400">Faithfulness to source research</p>
            </div>
            {renderStars(accuracyScore, setAccuracyScore)}
          </div>

          {/* Usefulness */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200">Overall Usefulness</span>
              <p className="text-[11px] text-slate-400">Did you grasp the core breakthrough?</p>
            </div>
            {renderStars(usefulnessScore, setUsefulnessScore)}
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Additional Review or Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did you like about the Host / Researcher conversation? Any specific methodology you wanted more of?"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
