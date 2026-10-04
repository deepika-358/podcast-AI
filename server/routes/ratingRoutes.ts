import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { Rating } from '../../src/types/index';

const router = Router();

router.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { podcastId, clarityScore, accuracyScore, usefulnessScore, overallScore, feedback } = req.body;

    if (!podcastId) {
      return res.status(400).json({ error: 'podcastId is required.' });
    }

    const podcast = db.getPodcastById(podcastId);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found.' });
    }

    const rating: Rating = {
      id: 'rat_' + Date.now() + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      podcastId,
      clarityScore: Math.min(5, Math.max(1, Number(clarityScore) || 5)),
      accuracyScore: Math.min(5, Math.max(1, Number(accuracyScore) || 5)),
      usefulnessScore: Math.min(5, Math.max(1, Number(usefulnessScore) || 5)),
      overallScore: Math.min(5, Math.max(1, Number(overallScore) || 5)),
      feedback: feedback?.trim() || '',
      createdAt: new Date().toISOString(),
      userName: user.name,
    };

    db.createRating(rating);

    // Record in history
    db.addHistory({
      id: 'hist_' + Date.now(),
      userId: user.id,
      actionType: 'rated',
      podcastId,
      paperId: podcast.paperId,
      title: `Rated podcast "${podcast.title}" ${rating.overallScore} stars`,
      timestamp: new Date().toISOString(),
      metadata: { score: rating.overallScore },
    });

    return res.status(201).json({ rating, message: 'Thank you for your rating!' });
  } catch (err: any) {
    console.error('Rating error:', err);
    return res.status(500).json({ error: 'Failed to record rating.' });
  }
});

router.get('/:podcastId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const ratings = db.getRatings(req.params.podcastId);
  return res.json({ ratings });
});

export default router;
