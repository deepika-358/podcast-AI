import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/:podcastId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const evalData = db.getEvaluationByPodcastId(req.params.podcastId);
  if (!evalData) {
    return res.status(404).json({ error: 'Evaluation report not found for this podcast.' });
  }
  return res.json({ evaluation: evalData });
});

export default router;
