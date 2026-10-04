import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { pipelineService } from '../services/pipelineService';
import { GeminiService } from '../services/geminiService';

const router = Router();

router.post('/generate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { paperId, customTitle } = req.body;

    if (!paperId) {
      return res.status(400).json({ error: 'paperId is required to generate a podcast.' });
    }

    const paper = db.getPaperById(paperId);
    if (!paper) {
      return res.status(404).json({ error: 'Research paper not found.' });
    }

    const { jobId, podcastId } = await pipelineService.startPipeline(user.id, paperId, customTitle);

    return res.status(202).json({
      message: 'Podcast generation pipeline started.',
      jobId,
      podcastId,
    });
  } catch (err: any) {
    console.error('Podcast generation initiation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to start podcast generation.' });
  }
});

router.get('/jobs/:jobId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const job = pipelineService.getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found or expired.' });
  }
  return res.json({ job });
});

router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const podcasts = db.getPodcasts(user.id);
  return res.json({ podcasts });
});

router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const podcast = db.getPodcastById(req.params.id);

  if (!podcast) {
    return res.status(404).json({ error: 'Podcast not found.' });
  }

  // Ensure user has access
  if (podcast.userId !== user.id && user.email !== 'demo@papercast.ai') {
    return res.status(403).json({ error: 'Access denied to this podcast.' });
  }

  return res.json({ podcast });
});

router.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const success = db.deletePodcast(req.params.id, user.id);

  if (!success) {
    return res.status(404).json({ error: 'Podcast not found or unauthorized.' });
  }

  return res.json({ message: 'Podcast deleted successfully.' });
});

router.post('/:id/record-listen', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const podcast = db.getPodcastById(req.params.id);

  if (!podcast) {
    return res.status(404).json({ error: 'Podcast not found.' });
  }

  const { completionPercentage } = req.body;

  db.addHistory({
    id: 'hist_' + Date.now(),
    userId: user.id,
    actionType: 'listened',
    paperId: podcast.paperId,
    podcastId: podcast.id,
    title: `Listened to: ${podcast.title}`,
    timestamp: new Date().toISOString(),
    metadata: {
      completionPercentage: completionPercentage || 100,
      duration: podcast.duration,
    },
  });

  return res.json({ message: 'Listen activity recorded.' });
});

router.get('/:id/audio', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const podcast = db.getPodcastById(req.params.id);
  if (!podcast) {
    return res.status(404).json({ error: 'Podcast not found.' });
  }

  // Try generating direct Gemini audio if API key is active
  if (process.env.GEMINI_API_KEY && podcast.script) {
    const audioData = await GeminiService.generateGeminiAudio(
      podcast.script.slice(0, 1500),
      'Kore'
    );
    if (audioData) {
      return res.json({ audioUrl: audioData, isSynthesized: true });
    }
  }

  // Return segments metadata for client-side audio player with dual-speaker TTS
  return res.json({
    audioUrl: null,
    isSynthesized: false,
    segments: podcast.segments,
    title: podcast.title,
    duration: podcast.duration,
  });
});

export default router;
