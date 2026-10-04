import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { GeminiService } from '../services/geminiService';
import { ResearchPaper, PaperSection } from '../../src/types/index';

const router = Router();

router.post('/upload', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { rawText, pdfBase64, fileName, fileSize, manualTitle } = req.body;

    if (!rawText && !pdfBase64) {
      return res.status(400).json({ error: 'Please upload a PDF file or provide research paper text.' });
    }

    if (fileSize && fileSize > 25 * 1024 * 1024) {
      return res.status(400).json({ error: 'File exceeds maximum supported size of 25MB.' });
    }

    // Process paper content via Gemini AI / Heuristic Extractor
    const extracted = await GeminiService.processPaperContent(
      rawText || '',
      pdfBase64,
      fileName || 'research_paper.pdf'
    );

    const paperId = 'paper_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const paperTitle = manualTitle || extracted.title || fileName?.replace(/\.pdf$/i, '') || 'Untitled Research Study';

    const paper: ResearchPaper = {
      id: paperId,
      userId: user.id,
      title: paperTitle,
      authors: extracted.authors,
      abstract: extracted.abstract,
      fileName: fileName || `${paperTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
      fileSize: fileSize || (rawText ? rawText.length : 1500000),
      uploadedAt: new Date().toISOString(),
      publicationDate: extracted.publicationDate || new Date().toISOString().split('T')[0],
      keywords: extracted.keywords,
      processingStatus: 'completed',
    };

    db.createPaper(paper);

    // Save extracted sections
    const sections: PaperSection[] = extracted.sections.map((sec, idx) => ({
      id: 'sec_' + paperId + '_' + idx,
      paperId,
      sectionName: sec.sectionName,
      originalText: sec.originalText,
      summary: sec.summary,
      orderIndex: sec.orderIndex ?? idx,
    }));
    db.createSections(sections);

    // Add to history
    db.addHistory({
      id: 'hist_' + Date.now(),
      userId: user.id,
      actionType: 'uploaded',
      paperId,
      title: `Uploaded research paper: ${paper.title}`,
      timestamp: new Date().toISOString(),
      metadata: { fileName: paper.fileName, fileSize: paper.fileSize },
    });

    return res.status(201).json({
      paper: { ...paper, sections },
      message: 'Paper successfully analyzed and sections extracted.',
    });
  } catch (err: any) {
    console.error('Paper upload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process research paper.' });
  }
});

router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const papers = db.getPapers(user.id);
  return res.json({ papers });
});

router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const paper = db.getPaperById(req.params.id);

  if (!paper) {
    return res.status(404).json({ error: 'Research paper not found.' });
  }

  // Ensure user owns paper or is demo user
  if (paper.userId !== user.id && user.email !== 'demo@papercast.ai') {
    return res.status(403).json({ error: 'You do not have permission to view this paper.' });
  }

  // Record viewed history
  db.addHistory({
    id: 'hist_' + Date.now(),
    userId: user.id,
    actionType: 'viewed',
    paperId: paper.id,
    title: `Viewed paper: ${paper.title}`,
    timestamp: new Date().toISOString(),
  });

  return res.json({ paper });
});

router.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const success = db.deletePaper(req.params.id, user.id);

  if (!success) {
    return res.status(404).json({ error: 'Paper not found or unauthorized.' });
  }

  return res.json({ message: 'Research paper and associated podcasts deleted.' });
});

router.post('/seed-sample', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { sampleType } = req.body;

  let title = 'AlphaFold: High-Accuracy Protein Structure Prediction';
  let authors = ['John Jumper', 'Richard Evans', 'Alexander Pritzel', 'Tim Green', 'Demis Hassabis'];
  let abstract = 'Proteins are essential to life, yet predicting their three-dimensional structure from amino acid sequences has been a 50-year grand challenge in biology. We present AlphaFold, a computational method that can regularly predict protein structures with atomic accuracy even in cases where no homologous structure is known.';
  let keywords = ['AlphaFold', 'Structural Biology', 'Protein Folding', 'Deep Learning', 'Cryo-EM'];

  if (sampleType === 'generative-agents') {
    title = 'Generative Agents: Interactive Simulacra of Human Behavior';
    authors = ['Joon Sung Park', 'Joseph C. O’Brien', 'Carrie J. Cai', 'Meredith Ringel Morris', 'Percy Liang', 'Michael S. Bernstein'];
    abstract = 'We introduce generative agents—computational software agents that simulate believable human behavior. Generative agents wake up, cook breakfast, head to work, form opinions, notice each other, and initiate conversations. We instantiate 25 agents in a sandbox world reminiscent of The Sims.';
    keywords = ['Generative Agents', 'Simulation', 'LLM Agents', 'Social Computing', 'Emergence'];
  }

  const paperId = 'paper_' + Date.now() + Math.random().toString(36).substring(2, 6);
  const paper: ResearchPaper = {
    id: paperId,
    userId: user.id,
    title,
    authors,
    abstract,
    fileName: `${title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}.pdf`,
    fileSize: 3100000,
    uploadedAt: new Date().toISOString(),
    publicationDate: '2021-07-15',
    keywords,
    processingStatus: 'completed',
  };

  db.createPaper(paper);

  const sections: PaperSection[] = [
    {
      id: 'sec_' + paperId + '_0',
      paperId,
      sectionName: 'abstract',
      orderIndex: 0,
      originalText: abstract,
      summary: abstract,
    },
    {
      id: 'sec_' + paperId + '_1',
      paperId,
      sectionName: 'methodology',
      orderIndex: 1,
      originalText: 'AlphaFold incorporates novel neural network architectures and training procedures based on the evolutionary, physical and geometric constraints of protein structures.',
      summary: 'Leverages an Evoformer trunk that repeatedly interchanges information between multiple sequence alignments (MSA) and residue pair representations to directly refine spatial atomic coordinates.',
    },
    {
      id: 'sec_' + paperId + '_2',
      paperId,
      sectionName: 'results',
      orderIndex: 2,
      originalText: 'In CASP14, AlphaFold structures achieved an overall median backbone GDT_TS score of 92.4, on par with experimental methods like X-ray crystallography.',
      summary: 'Demonstrated unprecedented 92.4 GDT_TS median score in CASP14, effectively solving the 50-year protein folding challenge at experimental precision.',
    },
    {
      id: 'sec_' + paperId + '_3',
      paperId,
      sectionName: 'conclusion',
      orderIndex: 3,
      originalText: 'Accurate structural models are expected to accelerate drug design, structural biology, and bioengineering worldwide.',
      summary: 'Transforms biological discovery by providing open, high-confidence 3D models for over 200 million cataloged proteins.',
    },
  ];
  db.createSections(sections);

  db.addHistory({
    id: 'hist_' + Date.now(),
    userId: user.id,
    actionType: 'uploaded',
    paperId,
    title: `Added sample paper: ${title}`,
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json({ paper: { ...paper, sections } });
});

export default router;
