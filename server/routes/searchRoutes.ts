import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const query = ((req.query.q as string) || '').trim().toLowerCase();
  const filterType = (req.query.type as string) || 'all'; // 'all' | 'papers' | 'podcasts'
  const filterStatus = (req.query.status as string) || 'all'; // 'all' | 'completed' | 'processing'

  // Log to search history if query is provided
  if (query) {
    db.addSearchHistory(user.id, query);
  }

  const papers = db.getPapers(user.id);
  const podcasts = db.getPodcasts(user.id);

  let filteredPapers = papers;
  let filteredPodcasts = podcasts;

  if (query) {
    filteredPapers = filteredPapers.filter(p => {
      const matchTitle = p.title.toLowerCase().includes(query);
      const matchAuthors = p.authors.some(a => a.toLowerCase().includes(query));
      const matchKeywords = p.keywords.some(k => k.toLowerCase().includes(query));
      const matchAbstract = p.abstract.toLowerCase().includes(query);
      return matchTitle || matchAuthors || matchKeywords || matchAbstract;
    });

    filteredPodcasts = filteredPodcasts.filter(pod => {
      const matchTitle = pod.title.toLowerCase().includes(query);
      const matchPaper = pod.paperTitle?.toLowerCase().includes(query);
      const matchAuthors = pod.paperAuthors?.some(a => a.toLowerCase().includes(query));
      const matchScript = pod.script.toLowerCase().includes(query);
      return matchTitle || matchPaper || matchAuthors || matchScript;
    });
  }

  if (filterStatus !== 'all') {
    if (filterStatus === 'completed') {
      filteredPapers = filteredPapers.filter(p => p.processingStatus === 'completed');
      filteredPodcasts = filteredPodcasts.filter(pod => pod.status === 'completed');
    } else if (filterStatus === 'processing') {
      filteredPapers = filteredPapers.filter(p => p.processingStatus === 'processing');
      filteredPodcasts = filteredPodcasts.filter(pod => pod.status !== 'completed');
    }
  }

  const searchHistory = db.getSearchHistory(user.id);

  return res.json({
    query,
    filterType,
    filterStatus,
    results: {
      papers: filterType === 'podcasts' ? [] : filteredPapers,
      podcasts: filterType === 'papers' ? [] : filteredPodcasts,
      totalCount: (filterType === 'podcasts' ? 0 : filteredPapers.length) + (filterType === 'papers' ? 0 : filteredPodcasts.length),
    },
    searchHistory,
  });
});

export default router;
