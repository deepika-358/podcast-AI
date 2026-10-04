import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './server/routes/authRoutes';
import paperRoutes from './server/routes/paperRoutes';
import podcastRoutes from './server/routes/podcastRoutes';
import evaluationRoutes from './server/routes/evaluationRoutes';
import ratingRoutes from './server/routes/ratingRoutes';
import searchRoutes from './server/routes/searchRoutes';
import historyRoutes from './server/routes/historyRoutes';
import analyticsRoutes from './server/routes/analyticsRoutes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware for JSON & URL-encoded payloads with 30MB limit for PDFs
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/papers', paperRoutes);
  app.use('/api/podcasts', podcastRoutes);
  app.use('/api/evaluations', evaluationRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      product: 'PaperCast AI',
      timestamp: new Date().toISOString(),
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PaperCast AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
