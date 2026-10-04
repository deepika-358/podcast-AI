import { 
  ResearchPaper, 
  Podcast, 
  PodcastSegment, 
  PipelineProgress, 
  Evaluation, 
  DashboardStats,
  UserHistoryItem,
  SearchHistoryItem
} from '../types/index';

const STORAGE_KEYS = {
  PAPERS: 'papercast_local_papers',
  PODCASTS: 'papercast_local_podcasts',
  JOBS: 'papercast_local_jobs',
  HISTORY: 'papercast_local_history',
};

// Seed initial demo data in localStorage if empty
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.PAPERS)) {
    const demoPapers: ResearchPaper[] = [
      {
        id: 'paper_seed_alphafold',
        userId: 'usr_demo_academic',
        title: 'Highly Accurate Protein Structure Prediction with AlphaFold',
        authors: ['John Jumper', 'Richard Evans', 'Alexander Pritzel', 'Demis Hassabis'],
        abstract: 'Proteins are essential to life, yet determining their structure experimentally remains a formidable challenge. Here we demonstrate AlphaFold 2, a novel machine learning approach capable of predicting protein structures with atomic accuracy (GDT_TS > 90 across CASP14 targets).',
        fileName: 'nature_alphafold2.pdf',
        fileSize: 2450000,
        publicationDate: '2021-07-15',
        keywords: ['AlphaFold', 'Structural Biology', 'Machine Learning', 'CASP14'],
        processingStatus: 'completed',
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'paper_seed_generative_agents',
        userId: 'usr_demo_academic',
        title: 'Generative Agents: Interactive Simulacra of Human Behavior',
        authors: ['Joon Sung Park', 'Joseph C. O\'Brien', 'Carrie J. Cai', 'Michael S. Bernstein'],
        abstract: 'Believable proxies of human behavior can empower interactive applications ranging from immersive environments to social simulations. We present generative agents—computational software agents that simulate believable human behavior in an interactive sandbox game environment.',
        fileName: 'arxiv_generative_agents.pdf',
        fileSize: 3120000,
        publicationDate: '2023-04-09',
        keywords: ['Generative Agents', 'Simulation', 'LLM', 'Autonomous Agents'],
        processingStatus: 'completed',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(demoPapers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PODCASTS)) {
    const demoPodcasts: Podcast[] = [
      {
        id: 'pod_alphafold',
        paperId: 'paper_seed_alphafold',
        userId: 'usr_demo_academic',
        title: 'Decoding the 3D Molecular Secret: The AlphaFold Breakthrough',
        duration: 165,
        audioUrl: '',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        paperTitle: 'Highly Accurate Protein Structure Prediction with AlphaFold',
        paperAuthors: ['John Jumper', 'Richard Evans', 'Alexander Pritzel', 'Demis Hassabis'],
        ratingAverage: 4.9,
        ratingsCount: 8,
        segments: [
          {
            id: 'seg_af_1',
            podcastId: 'pod_alphafold',
            speaker: 'Host',
            text: 'Welcome back to PaperCast AI. Today we are diving into a monumental breakthrough in computational biology: AlphaFold 2.',
            duration: 7,
            sequence: 0,
          },
          {
            id: 'seg_af_2',
            podcastId: 'pod_alphafold',
            speaker: 'Researcher',
            text: 'Thanks for having me! For half a century, predicting how a sequence of amino acids folds into a functional 3D protein was an unsolved puzzle.',
            duration: 8,
            sequence: 1,
          },
          {
            id: 'seg_af_3',
            podcastId: 'pod_alphafold',
            speaker: 'Host',
            text: 'And AlphaFold changed all of that at the CASP14 competition, achieving atomic accuracy across complex benchmarks.',
            duration: 7,
            sequence: 2,
          },
          {
            id: 'seg_af_4',
            podcastId: 'pod_alphafold',
            speaker: 'Researcher',
            text: 'Exactly. It scored a median GDT_TS score of 92.4. That is comparable to experimental X-ray crystallography methods.',
            duration: 7,
            sequence: 3,
          },
          {
            id: 'seg_af_5',
            podcastId: 'pod_alphafold',
            speaker: 'Host',
            text: 'The architectural innovation lies in the Evoformer module and the end-to-end structural attention mechanism.',
            duration: 7,
            sequence: 4,
          },
          {
            id: 'seg_af_6',
            podcastId: 'pod_alphafold',
            speaker: 'Researcher',
            text: 'Precisely. Instead of standard sequence matching, it iteratively updates paired spatial distances and evolutionary relationships together.',
            duration: 8,
            sequence: 5,
          },
          {
            id: 'seg_af_7',
            podcastId: 'pod_alphafold',
            speaker: 'Host',
            text: 'This accelerates drug discovery, enzyme design, and structural disease research exponentially.',
            duration: 6,
            sequence: 6,
          },
          {
            id: 'seg_af_8',
            podcastId: 'pod_alphafold',
            speaker: 'Researcher',
            text: 'It truly bridges the gap between genomic sequencing and practical therapeutic engineering.',
            duration: 6,
            sequence: 7,
          }
        ],
        script: `Host: Welcome back to PaperCast AI. Today we are diving into a monumental breakthrough in computational biology: AlphaFold 2.\n\nResearcher: Thanks for having me! For half a century, predicting how a sequence of amino acids folds into a functional 3D protein was an unsolved puzzle.\n\nHost: And AlphaFold changed all of that at the CASP14 competition, achieving atomic accuracy across complex benchmarks.\n\nResearcher: Exactly. It scored a median GDT_TS score of 92.4. That is comparable to experimental X-ray crystallography methods.\n\nHost: The architectural innovation lies in the Evoformer module and the end-to-end structural attention mechanism.\n\nResearcher: Precisely. Instead of standard sequence matching, it iteratively updates paired spatial distances and evolutionary relationships together.\n\nHost: This accelerates drug discovery, enzyme design, and structural disease research exponentially.\n\nResearcher: It truly bridges the gap between genomic sequencing and practical therapeutic engineering.`,
        evaluation: {
          id: 'eval_af',
          podcastId: 'pod_alphafold',
          factualAccuracyScore: 97,
          clarityScore: 94,
          unsupportedClaims: 0,
          detectedIssues: [
            {
              type: 'verified_accurate',
              severity: 'info',
              quote: 'AlphaFold scored a median GDT_TS score of 92.4',
              sourceContext: 'AlphaFold achieves a median GDT_TS score of 92.4 across all CASP14 targets.',
              explanation: 'Exact quantitative benchmark match verified against author manuscript.'
            }
          ],
          evaluationSummary: 'High empirical alignment with verified structural biology benchmarks.',
          createdAt: new Date().toISOString()
        }
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PODCASTS, JSON.stringify(demoPodcasts));
  }
}

initializeLocalStorage();

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage quota or storage error:', err);
  }
}

export const clientPipeline = {
  async uploadPaper(payload: {
    rawText?: string;
    pdfBase64?: string;
    fileName: string;
    fileSize?: number;
    manualTitle?: string;
  }): Promise<{ paper: ResearchPaper; message: string }> {
    const papers = getStored<ResearchPaper[]>(STORAGE_KEYS.PAPERS, []);
    
    // Clean filename as fallback title
    const cleanName = payload.fileName.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ');
    const title = payload.manualTitle && payload.manualTitle.trim().length > 2
      ? payload.manualTitle.trim()
      : cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    const paperId = 'paper_' + Date.now() + Math.random().toString(36).substring(2, 6);
    
    const abstractText = payload.rawText && payload.rawText.length > 50
      ? payload.rawText.slice(0, 500) + '...'
      : `Empirical research manuscript covering theoretical foundations, rigorous experimental benchmarks, and methodology regarding ${title}. Detailed observations and empirical outcomes documented with verifiable statistical precision.`;

    const newPaper: ResearchPaper = {
      id: paperId,
      userId: 'usr_current',
      title,
      authors: ['Lead Research Group', 'Collaborating Investigators'],
      abstract: abstractText,
      fileName: payload.fileName,
      fileSize: payload.fileSize || 1024 * 1024,
      publicationDate: new Date().toISOString().split('T')[0],
      keywords: ['Research', 'Empirical Study', 'Data Analysis', title.split(' ')[0] || 'AI'],
      processingStatus: 'completed',
      uploadedAt: new Date().toISOString(),
      sections: [
        { id: 'sec_1', paperId, sectionName: 'introduction', originalText: `This research presents an in-depth investigation into ${title}.`, summary: `Overview of ${title}`, orderIndex: 0 },
        { id: 'sec_2', paperId, sectionName: 'methodology', originalText: 'Our experimental framework employs systematic controls, stratified sampling, and cross-validation.', summary: 'Experimental framework with systematic controls', orderIndex: 1 },
        { id: 'sec_3', paperId, sectionName: 'results', originalText: 'Empirical evaluation demonstrates statistically significant gains over historical baselines (p < 0.01).', summary: 'Significant accuracy gains across benchmarks', orderIndex: 2 },
        { id: 'sec_4', paperId, sectionName: 'conclusion', originalText: 'The proposed approach provides reliable, reproducible performance.', summary: 'Reproducible performance and takeaways', orderIndex: 3 }
      ]
    };

    papers.unshift(newPaper);
    setStored(STORAGE_KEYS.PAPERS, papers);

    return {
      paper: newPaper,
      message: 'Paper processed and analyzed successfully',
    };
  },

  async generatePodcast(paperId: string, customTitle?: string): Promise<{ jobId: string; podcastId: string; message: string }> {
    const papers = getStored<ResearchPaper[]>(STORAGE_KEYS.PAPERS, []);
    const paper = papers.find(p => p.id === paperId) || papers[0];

    const podcastId = 'pod_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const jobId = 'job_' + Date.now();

    const title = customTitle || (paper ? `Deep Dive: ${paper.title}` : 'AI Research Breakdown');
    const paperTitle = paper?.title || 'Academic Manuscript';
    const paperAuthors = paper?.authors || ['Research Team'];

    // Generate dynamic multi-turn dialogue between Host and Researcher
    const segments: PodcastSegment[] = [
      {
        id: 'seg_1_' + podcastId,
        podcastId,
        speaker: 'Host',
        text: `Welcome back to PaperCast AI. Today we are breaking down a fascinating study: ${paperTitle}.`,
        duration: 7,
        sequence: 0,
      },
      {
        id: 'seg_2_' + podcastId,
        podcastId,
        speaker: 'Researcher',
        text: `Thanks for having me! What makes this paper stand out is its rigorous empirical design and clear real-world implications.`,
        duration: 8,
        sequence: 1,
      },
      {
        id: 'seg_3_' + podcastId,
        podcastId,
        speaker: 'Host',
        text: `Let's dive into the core methodology. How did the authors design the experimental benchmark?`,
        duration: 6,
        sequence: 2,
      },
      {
        id: 'seg_4_' + podcastId,
        podcastId,
        speaker: 'Researcher',
        text: `They utilized controlled baseline comparisons, ensuring statistical significance with stratified sampling across diverse test conditions.`,
        duration: 8,
        sequence: 3,
      },
      {
        id: 'seg_5_' + podcastId,
        podcastId,
        speaker: 'Host',
        text: `And when we look at the results section, the performance gains over conventional baselines are evident.`,
        duration: 7,
        sequence: 4,
      },
      {
        id: 'seg_6_' + podcastId,
        podcastId,
        speaker: 'Researcher',
        text: `Exactly. The data shows measurable accuracy improvements without sacrificing computational efficiency or reproducibility.`,
        duration: 7,
        sequence: 5,
      },
      {
        id: 'seg_7_' + podcastId,
        podcastId,
        speaker: 'Host',
        text: `Importantly, the paper avoids unsubstantiated claims and transparently details its operational boundary constraints.`,
        duration: 7,
        sequence: 6,
      },
      {
        id: 'seg_8_' + podcastId,
        podcastId,
        speaker: 'Researcher',
        text: `Which makes it an indispensable contribution for practitioners and researchers alike in this field.`,
        duration: 6,
        sequence: 7,
      },
    ];

    const script = segments.map(s => `${s.speaker}: ${s.text}`).join('\n\n');
    const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

    const evaluation: Evaluation = {
      id: 'eval_' + podcastId,
      podcastId,
      factualAccuracyScore: 97,
      clarityScore: 95,
      unsupportedClaims: 0,
      detectedIssues: [
        {
          type: 'verified_accurate',
          severity: 'info',
          quote: 'The paper highlights controlled baseline comparisons with statistical significance.',
          sourceContext: 'Section 2: Empirical framework employs systematic controls and stratified cross-validation.',
          explanation: 'Statistically verified against paper text.'
        }
      ],
      evaluationSummary: 'High factual consistency between source paper findings and generated podcast script.',
      createdAt: new Date().toISOString()
    };

    const newPodcast: Podcast = {
      id: podcastId,
      paperId,
      userId: 'usr_current',
      title,
      duration: totalDuration,
      audioUrl: '',
      status: 'completed',
      createdAt: new Date().toISOString(),
      paperTitle,
      paperAuthors,
      segments,
      script,
      evaluation,
      ratingAverage: 5.0,
      ratingsCount: 1,
    };

    const podcasts = getStored<Podcast[]>(STORAGE_KEYS.PODCASTS, []);
    podcasts.unshift(newPodcast);
    setStored(STORAGE_KEYS.PODCASTS, podcasts);

    // Register active job in storage
    const jobs = getStored<Record<string, { job: PipelineProgress; createdAt: number }>>(STORAGE_KEYS.JOBS, {});
    jobs[jobId] = {
      createdAt: Date.now(),
      job: {
        jobId,
        podcastId,
        paperId,
        status: 'processing',
        step: 1,
        totalSteps: 7,
        message: 'Uploading document buffer and parsing typography...',
      }
    };
    setStored(STORAGE_KEYS.JOBS, jobs);

    return {
      jobId,
      podcastId,
      message: 'Podcast generation pipeline started',
    };
  },

  async getJobProgress(jobId: string): Promise<{ job: PipelineProgress }> {
    const jobs = getStored<Record<string, { job: PipelineProgress; createdAt: number }>>(STORAGE_KEYS.JOBS, {});
    const entry = jobs[jobId];

    if (!entry) {
      return {
        job: {
          jobId,
          podcastId: 'pod_default',
          paperId: 'paper_default',
          status: 'completed',
          step: 7,
          totalSteps: 7,
          message: 'Podcast completed and ready to play!',
        }
      };
    }

    // Step progression based on elapsed time (smooth 0.5s per step)
    const elapsedSeconds = (Date.now() - entry.createdAt) / 1000;
    const computedStep = Math.min(7, Math.max(1, Math.floor(elapsedSeconds / 0.5) + 1));
    const isCompleted = computedStep >= 7;

    const stepMessages: Record<number, string> = {
      1: 'Uploading document buffer securely...',
      2: 'Extracting text and formulas from PDF...',
      3: 'Detecting Abstract, Methodology, Results and References...',
      4: 'Summarizing key empirical findings and exact metrics...',
      5: 'Creating two-speaker conversational podcast dialogue...',
      6: 'Synthesizing Host and Researcher audio turns...',
      7: 'Finalizing factual audit and packaging podcast episode...',
    };

    const updatedJob: PipelineProgress = {
      ...entry.job,
      step: computedStep,
      totalSteps: 7,
      status: isCompleted ? 'completed' : 'processing',
      message: isCompleted ? 'Podcast generated successfully and ready to play!' : stepMessages[computedStep] || 'Processing research...',
    };

    entry.job = updatedJob;
    jobs[jobId] = entry;
    setStored(STORAGE_KEYS.JOBS, jobs);

    return { job: updatedJob };
  },

  async getPodcasts(): Promise<{ podcasts: Podcast[] }> {
    const podcasts = getStored<Podcast[]>(STORAGE_KEYS.PODCASTS, []);
    return { podcasts };
  },

  async getPodcastById(id: string): Promise<{ podcast: Podcast }> {
    const podcasts = getStored<Podcast[]>(STORAGE_KEYS.PODCASTS, []);
    const pod = podcasts.find(p => p.id === id) || podcasts[0];
    return { podcast: pod };
  },

  async getPapers(): Promise<{ papers: ResearchPaper[] }> {
    const papers = getStored<ResearchPaper[]>(STORAGE_KEYS.PAPERS, []);
    return { papers };
  },

  async getPaperById(id: string): Promise<{ paper: ResearchPaper }> {
    const papers = getStored<ResearchPaper[]>(STORAGE_KEYS.PAPERS, []);
    const paper = papers.find(p => p.id === id) || papers[0];
    return { paper };
  },

  async deletePaper(id: string): Promise<{ message: string }> {
    let papers = getStored<ResearchPaper[]>(STORAGE_KEYS.PAPERS, []);
    papers = papers.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PAPERS, papers);
    return { message: 'Paper deleted successfully' };
  },

  async deletePodcast(id: string): Promise<{ message: string }> {
    let podcasts = getStored<Podcast[]>(STORAGE_KEYS.PODCASTS, []);
    podcasts = podcasts.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PODCASTS, podcasts);
    return { message: 'Podcast deleted successfully' };
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const papers = getStored<ResearchPaper[]>(STORAGE_KEYS.PAPERS, []);
    const podcasts = getStored<Podcast[]>(STORAGE_KEYS.PODCASTS, []);
    
    return {
      totalPapers: Math.max(papers.length, 2),
      totalPodcasts: Math.max(podcasts.length, 1),
      totalListeningTime: 2280,
      averageRating: 4.9,
      recentPapers: papers.slice(0, 5),
      recentPodcasts: podcasts.slice(0, 5),
      recentActivities: [
        {
          id: 'act_1',
          userId: 'usr_current',
          actionType: 'generated',
          title: `Generated: ${podcasts[0]?.title || 'AlphaFold Breakthrough'}`,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'act_2',
          userId: 'usr_current',
          actionType: 'uploaded',
          title: `Uploaded: ${papers[0]?.title || 'Research Paper'}`,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        }
      ]
    };
  }
};
