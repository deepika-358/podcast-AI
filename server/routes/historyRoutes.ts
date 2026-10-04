import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const history = db.getHistory(user.id);

  // Group history by Today, Yesterday, and Earlier
  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayDate = yesterday.toISOString().split('T')[0];

  const grouped = {
    today: [] as typeof history,
    yesterday: [] as typeof history,
    earlier: [] as typeof history,
  };

  history.forEach(item => {
    const itemDate = item.timestamp.split('T')[0];
    if (itemDate === todayDate) {
      grouped.today.push(item);
    } else if (itemDate === yesterdayDate) {
      grouped.yesterday.push(item);
    } else {
      grouped.earlier.push(item);
    }
  });

  return res.json({ history, grouped });
});

router.delete('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.clearHistory(user.id);
  return res.json({ message: 'History cleared successfully.' });
});

export default router;
