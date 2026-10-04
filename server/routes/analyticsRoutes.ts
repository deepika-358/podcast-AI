import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const papers = db.getPapers(user.id);
  const podcasts = db.getPodcasts(user.id);
  const history = db.getHistory(user.id);

  // Calculate total listening time from listen events or completed podcasts
  const listenEvents = history.filter(h => h.actionType === 'listened');
  let totalListeningSeconds = 0;
  listenEvents.forEach(e => {
    totalListeningSeconds += (e.metadata?.duration || 120);
  });
  if (totalListeningSeconds === 0 && podcasts.length > 0) {
    totalListeningSeconds = podcasts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.duration, 0);
  }

  // Calculate average rating
  const ratings = podcasts.map(p => p.ratingAverage).filter((r): r is number => typeof r === 'number' && r > 0);
  const avgRating = ratings.length > 0 
    ? +(ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
    : 4.9;

  return res.json({
    totalPapers: papers.length,
    totalPodcasts: podcasts.length,
    totalListeningTime: totalListeningSeconds,
    averageRating: avgRating,
    recentPapers: papers.slice(0, 5),
    recentPodcasts: podcasts.slice(0, 5),
    recentActivities: history.slice(0, 8),
  });
});

export default router;
