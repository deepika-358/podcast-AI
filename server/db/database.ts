import fs from 'fs';
import path from 'path';
import { 
  User, 
  ResearchPaper, 
  PaperSection, 
  Podcast, 
  PodcastSegment, 
  Rating, 
  UserHistoryItem, 
  SearchHistoryItem, 
  Evaluation 
} from '../../src/types/index';

interface DatabaseSchema {
  users: User[];
  research_papers: ResearchPaper[];
  paper_sections: PaperSection[];
  podcasts: Podcast[];
  podcast_segments: PodcastSegment[];
  ratings: Rating[];
  user_history: UserHistoryItem[];
  search_history: SearchHistoryItem[];
  evaluations: Evaluation[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = {
      users: [],
      research_papers: [],
      paper_sections: [],
      podcasts: [],
      podcast_segments: [],
      ratings: [],
      user_history: [],
      search_history: [],
      evaluations: [],
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          users: parsed.users || [],
          research_papers: parsed.research_papers || [],
          paper_sections: parsed.paper_sections || [],
          podcasts: parsed.podcasts || [],
          podcast_segments: parsed.podcast_segments || [],
          ratings: parsed.ratings || [],
          user_history: parsed.user_history || [],
          search_history: parsed.search_history || [],
          evaluations: parsed.evaluations || [],
        };
      } else {
        this.seedInitialData();
        this.saveImmediately();
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      this.seedInitialData();
    }
  }

  private saveImmediately() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveImmediately();
    }, 200);
  }

  // Users
  public getUsers() { return this.data.users; }
  public getUserById(id: string) { return this.data.users.find(u => u.id === id); }
  public getUserByEmail(email: string) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  public createUser(user: User) {
    this.data.users.push(user);
    this.save();
    return user;
  }
  public updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // Papers
  public getPapers(userId?: string) {
    if (userId) {
      return this.data.research_papers.filter(p => p.userId === userId);
    }
    return this.data.research_papers;
  }
  public getPaperById(id: string) {
    const paper = this.data.research_papers.find(p => p.id === id);
    if (!paper) return null;
    const sections = this.data.paper_sections
      .filter(s => s.paperId === id)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    return { ...paper, sections };
  }
  public createPaper(paper: ResearchPaper) {
    this.data.research_papers.unshift(paper);
    this.save();
    return paper;
  }
  public updatePaper(id: string, updates: Partial<ResearchPaper>) {
    const idx = this.data.research_papers.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.research_papers[idx] = { ...this.data.research_papers[idx], ...updates };
      this.save();
      return this.data.research_papers[idx];
    }
    return null;
  }
  public deletePaper(id: string, userId: string) {
    const paper = this.data.research_papers.find(p => p.id === id && p.userId === userId);
    if (!paper) return false;
    this.data.research_papers = this.data.research_papers.filter(p => p.id !== id);
    this.data.paper_sections = this.data.paper_sections.filter(s => s.paperId !== id);
    
    // Also delete associated podcasts
    const podcastIds = this.data.podcasts.filter(p => p.paperId === id).map(p => p.id);
    this.data.podcasts = this.data.podcasts.filter(p => p.paperId !== id);
    this.data.podcast_segments = this.data.podcast_segments.filter(s => !podcastIds.includes(s.podcastId));
    this.data.evaluations = this.data.evaluations.filter(e => !podcastIds.includes(e.podcastId));
    this.data.ratings = this.data.ratings.filter(r => !podcastIds.includes(r.podcastId));
    
    this.save();
    return true;
  }

  // Sections
  public getSectionsByPaperId(paperId: string) {
    return this.data.paper_sections
      .filter(s => s.paperId === paperId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }
  public createSections(sections: PaperSection[]) {
    this.data.paper_sections.push(...sections);
    this.save();
    return sections;
  }
  public deleteSectionsByPaperId(paperId: string) {
    this.data.paper_sections = this.data.paper_sections.filter(s => s.paperId !== paperId);
    this.save();
  }

  // Podcasts
  public getPodcasts(userId?: string) {
    const podcasts = userId 
      ? this.data.podcasts.filter(p => p.userId === userId)
      : this.data.podcasts;
    
    return podcasts.map(p => {
      const paper = this.data.research_papers.find(rp => rp.id === p.paperId);
      const segments = this.data.podcast_segments
        .filter(s => s.podcastId === p.id)
        .sort((a, b) => a.sequence - b.sequence);
      const evalObj = this.data.evaluations.find(e => e.podcastId === p.id);
      const ratings = this.data.ratings.filter(r => r.podcastId === p.id);
      const ratingAvg = ratings.length > 0 
        ? +(ratings.reduce((sum, r) => sum + r.overallScore, 0) / ratings.length).toFixed(1)
        : 0;

      return {
        ...p,
        paperTitle: paper?.title,
        paperAuthors: paper?.authors,
        segments,
        evaluation: evalObj,
        ratingAverage: ratingAvg,
        ratingsCount: ratings.length
      };
    });
  }

  public getPodcastById(id: string) {
    const podcast = this.data.podcasts.find(p => p.id === id);
    if (!podcast) return null;
    const paper = this.data.research_papers.find(rp => rp.id === podcast.paperId);
    const segments = this.data.podcast_segments
      .filter(s => s.podcastId === id)
      .sort((a, b) => a.sequence - b.sequence);
    const evaluation = this.data.evaluations.find(e => e.podcastId === id);
    const ratings = this.data.ratings.filter(r => r.podcastId === id);
    const ratingAvg = ratings.length > 0 
      ? +(ratings.reduce((sum, r) => sum + r.overallScore, 0) / ratings.length).toFixed(1)
      : 0;

    return {
      ...podcast,
      paperTitle: paper?.title,
      paperAuthors: paper?.authors,
      segments,
      evaluation,
      ratingAverage: ratingAvg,
      ratingsCount: ratings.length
    };
  }

  public createPodcast(podcast: Podcast) {
    this.data.podcasts.unshift(podcast);
    this.save();
    return podcast;
  }

  public updatePodcast(id: string, updates: Partial<Podcast>) {
    const idx = this.data.podcasts.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.podcasts[idx] = { ...this.data.podcasts[idx], ...updates };
      this.save();
      return this.data.podcasts[idx];
    }
    return null;
  }

  public deletePodcast(id: string, userId: string) {
    const podcast = this.data.podcasts.find(p => p.id === id && p.userId === userId);
    if (!podcast) return false;
    this.data.podcasts = this.data.podcasts.filter(p => p.id !== id);
    this.data.podcast_segments = this.data.podcast_segments.filter(s => s.podcastId !== id);
    this.data.evaluations = this.data.evaluations.filter(e => e.podcastId !== id);
    this.data.ratings = this.data.ratings.filter(r => r.podcastId !== id);
    this.save();
    return true;
  }

  // Segments
  public createSegments(segments: PodcastSegment[]) {
    this.data.podcast_segments.push(...segments);
    this.save();
    return segments;
  }

  // Ratings
  public getRatings(podcastId: string) {
    return this.data.ratings.filter(r => r.podcastId === podcastId);
  }

  public createRating(rating: Rating) {
    this.data.ratings.unshift(rating);
    this.save();
    return rating;
  }

  // History
  public getHistory(userId: string) {
    return this.data.user_history
      .filter(h => h.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addHistory(item: UserHistoryItem) {
    this.data.user_history.unshift(item);
    // keep max 200 items per user
    if (this.data.user_history.length > 500) {
      this.data.user_history = this.data.user_history.slice(0, 500);
    }
    this.save();
    return item;
  }

  public clearHistory(userId: string) {
    this.data.user_history = this.data.user_history.filter(h => h.userId !== userId);
    this.save();
    return true;
  }

  // Search History
  public getSearchHistory(userId: string) {
    return this.data.search_history
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime())
      .slice(0, 10);
  }

  public addSearchHistory(userId: string, query: string) {
    if (!query.trim()) return;
    // Remove duplicate recent queries
    this.data.search_history = this.data.search_history.filter(
      s => !(s.userId === userId && s.query.toLowerCase() === query.trim().toLowerCase())
    );
    this.data.search_history.unshift({
      id: 'sh_' + Date.now() + Math.random().toString(36).substring(2, 5),
      userId,
      query: query.trim(),
      searchedAt: new Date().toISOString()
    });
    this.save();
  }

  // Evaluation
  public getEvaluationByPodcastId(podcastId: string) {
    return this.data.evaluations.find(e => e.podcastId === podcastId);
  }

  public createEvaluation(evaluation: Evaluation) {
    this.data.evaluations.unshift(evaluation);
    this.save();
    return evaluation;
  }

  // Seed Data
  private seedInitialData() {
    const demoUser: User = {
      id: 'usr_demo_academic',
      name: 'Dr. Elena Vance',
      email: 'demo@papercast.ai',
      role: 'academic',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-09-01T10:00:00.000Z',
      lastLogin: new Date().toISOString(),
      preferences: {
        theme: 'dark',
        hostVoice: 'Puck',
        researcherVoice: 'Kore',
        audioSpeed: 1,
        emailNotifications: true,
      },
    };

    const paper1: ResearchPaper = {
      id: 'paper_attention_2017',
      userId: demoUser.id,
      title: 'Attention Is All You Need: The Transformer Architecture',
      authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Lukasz Kaiser', 'Illia Polosukhin'],
      abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
      fileName: 'vaswani2017_attention.pdf',
      fileSize: 2200000,
      uploadedAt: '2026-09-28T14:20:00.000Z',
      publicationDate: '2017-06-12',
      keywords: ['Transformers', 'Self-Attention', 'NLP', 'Machine Translation', 'Neural Networks'],
      processingStatus: 'completed',
    };

    const paper1Sections: PaperSection[] = [
      {
        id: 'sec_1',
        paperId: paper1.id,
        sectionName: 'abstract',
        orderIndex: 0,
        originalText: 'We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.',
        summary: 'Introduces the Transformer model, abandoning recurrent and convolutional neural networks entirely in favor of multi-head self-attention, dramatically speeding up training time to 12 hours on 8 GPUs.'
      },
      {
        id: 'sec_2',
        paperId: paper1.id,
        sectionName: 'introduction',
        orderIndex: 1,
        originalText: 'Recurrent neural networks, particularly LSTM and GRU, have been established as state of the art in sequential modeling. However, sequential computation precludes parallelization within training examples, which becomes critical at longer sequence lengths.',
        summary: 'Identifies the fundamental bottleneck of sequential computation in RNNs/LSTMs: inability to parallelize across tokens, leading to computational bottlenecks on large text corpora.'
      },
      {
        id: 'sec_3',
        paperId: paper1.id,
        sectionName: 'methodology',
        orderIndex: 2,
        originalText: 'The Transformer follows an encoder-decoder structure using stacked self-attention and point-wise, fully connected layers. We utilize Scaled Dot-Product Attention: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V, and extend it to Multi-Head Attention with 8 parallel attention heads.',
        summary: 'Employs an encoder-decoder topology with Scaled Dot-Product Attention normalized by sqrt(d_k), expanding to 8 parallel attention heads with dimension d_model=512.'
      },
      {
        id: 'sec_4',
        paperId: paper1.id,
        sectionName: 'results',
        orderIndex: 3,
        originalText: 'On the WMT 2014 English-to-German translation task, the big transformer model achieves a state-of-the-art BLEU score of 28.4, outperforming existing best models by more than 2.0 BLEU. On English-to-French, it sets a single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on 8 GPUs.',
        summary: 'Achieved 28.4 BLEU on WMT 2014 English-German (beating prior SOTA by >2.0 BLEU) and 41.8 BLEU on English-French with a fraction of prior training cost.'
      },
      {
        id: 'sec_5',
        paperId: paper1.id,
        sectionName: 'conclusion',
        orderIndex: 4,
        originalText: 'We presented the Transformer, the first sequence transduction model based entirely on attention, replacing recurrent layers with multi-headed self-attention. It can be trained significantly faster than architectures based on recurrent or convolutional layers.',
        summary: 'Self-attention completely supersedes recurrence for sequence transduction, establishing the structural foundation for all contemporary large language models.'
      }
    ];

    const podcast1: Podcast = {
      id: 'pod_attention_2017',
      userId: demoUser.id,
      paperId: paper1.id,
      title: 'Attention Is All You Need: The Breakthrough That Changed AI Forever',
      script: `HOST: Welcome to PaperCast AI! Today we're breaking down one of the most cited research papers in computer science history: "Attention Is All You Need" by Vaswani and colleagues at Google Brain and Google Research. Dr. Aris, what was the burning problem researchers faced before this paper?

RESEARCHER: Great to be here! Before 2017, almost all language models were built on Recurrent Neural Networks, or RNNs. The fatal flaw was sequential processing: to understand the tenth word in a sentence, the computer had to compute words one through nine first. You couldn't parallelize it across modern GPUs.

HOST: Exactly, so training on massive internet text took weeks or months. How did the Transformer solve this bottleneck?

RESEARCHER: The authors boldly asked: what if we throw away recurrence completely? Instead, they used "Self-Attention". Every word in a sentence looks at every other word simultaneously, calculating relevance scores with queries, keys, and values.

HOST: And the authors backed it up with dramatic numbers. What did the experimental results show?

RESEARCHER: The results were stunning. On the English-to-German translation benchmark, the Transformer achieved a 28.4 BLEU score, surpassing previous state-of-the-art models by over 2.0 points. Even more impressive, they trained it in just 12 hours on eight P100 GPUs, compared to weeks of training for earlier models.

HOST: That efficiency ignited the entire generative AI revolution, from BERT to GPT and modern multimodal models. What limitations should listeners keep in mind?

RESEARCHER: The main limitation noted in the paper is quadratic complexity with respect to sequence length, which later researchers addressed. But the core insight—that attention alone is sufficient—stands as a monumental paradigm shift.`,
      duration: 172,
      status: 'completed',
      createdAt: '2026-09-28T14:24:00.000Z',
      completedAt: '2026-09-28T14:25:30.000Z',
    };

    const podcast1Segments: PodcastSegment[] = [
      {
        id: 'seg_1',
        podcastId: podcast1.id,
        speaker: 'Host',
        text: "Welcome to PaperCast AI! Today we're breaking down one of the most cited research papers in computer science history: 'Attention Is All You Need' by Vaswani and colleagues at Google Brain and Google Research. Dr. Aris, what was the burning problem researchers faced before this paper?",
        sequence: 0,
        duration: 16
      },
      {
        id: 'seg_2',
        podcastId: podcast1.id,
        speaker: 'Researcher',
        text: "Great to be here! Before 2017, almost all language models were built on Recurrent Neural Networks, or RNNs. The fatal flaw was sequential processing: to understand the tenth word in a sentence, the computer had to compute words one through nine first. You couldn't parallelize it across modern GPUs.",
        sequence: 1,
        duration: 18
      },
      {
        id: 'seg_3',
        podcastId: podcast1.id,
        speaker: 'Host',
        text: "Exactly, so training on massive internet text took weeks or months. How did the Transformer solve this bottleneck?",
        sequence: 2,
        duration: 8
      },
      {
        id: 'seg_4',
        podcastId: podcast1.id,
        speaker: 'Researcher',
        text: "The authors boldly asked: what if we throw away recurrence completely? Instead, they used 'Self-Attention'. Every word in a sentence looks at every other word simultaneously, calculating relevance scores with queries, keys, and values.",
        sequence: 3,
        duration: 16
      },
      {
        id: 'seg_5',
        podcastId: podcast1.id,
        speaker: 'Host',
        text: "And the authors backed it up with dramatic numbers. What did the experimental results show?",
        sequence: 4,
        duration: 7
      },
      {
        id: 'seg_6',
        podcastId: podcast1.id,
        speaker: 'Researcher',
        text: "The results were stunning. On the English-to-German translation benchmark, the Transformer achieved a 28.4 BLEU score, surpassing previous state-of-the-art models by over 2.0 points. Even more impressive, they trained it in just 12 hours on eight P100 GPUs, compared to weeks of training for earlier models.",
        sequence: 5,
        duration: 21
      },
      {
        id: 'seg_7',
        podcastId: podcast1.id,
        speaker: 'Host',
        text: "That efficiency ignited the entire generative AI revolution, from BERT to GPT and modern multimodal models. What limitations should listeners keep in mind?",
        sequence: 6,
        duration: 11
      },
      {
        id: 'seg_8',
        podcastId: podcast1.id,
        speaker: 'Researcher',
        text: "The main limitation noted in the paper is quadratic complexity with respect to sequence length, which later researchers addressed. But the core insight—that attention alone is sufficient—stands as a monumental paradigm shift.",
        sequence: 7,
        duration: 15
      }
    ];

    const eval1: Evaluation = {
      id: 'eval_1',
      podcastId: podcast1.id,
      factualAccuracyScore: 96,
      clarityScore: 94,
      unsupportedClaims: 0,
      detectedIssues: [
        {
          type: 'verified_accurate',
          severity: 'info',
          quote: '28.4 BLEU score, surpassing previous state-of-the-art models by over 2.0 points',
          sourceContext: 'Table 2: WMT 2014 English-to-German BLEU score 28.4 vs previous best 26.3',
          explanation: 'Strictly matches Table 2 of Vaswani et al. Numerical claim is 100% faithful.'
        },
        {
          type: 'verified_accurate',
          severity: 'info',
          quote: '12 hours on eight P100 GPUs',
          sourceContext: 'Section 5.2 Model Variations: Base model trained for 100,000 steps or 12 hours on 8 P100 GPUs.',
          explanation: 'Hardware specification and training duration verified directly against source text.'
        },
        {
          type: 'simplification',
          severity: 'low',
          quote: 'throw away recurrence completely',
          sourceContext: 'Section 1: Dispensing with recurrence and convolutions entirely.',
          explanation: 'Conversational metaphor accurately conveys the methodological shift from RNNs to pure attention.'
        }
      ],
      evaluationSummary: 'The podcast demonstrates exceptionally high fidelity to Vaswani et al. (2017). All quantitative metrics (28.4 BLEU, 12 hours training, 8 P100 GPUs) accurately mirror source tables with zero hallucinated author claims or invented benchmarks.',
      createdAt: '2026-09-28T14:26:00.000Z'
    };

    const rating1: Rating = {
      id: 'rat_1',
      userId: demoUser.id,
      podcastId: podcast1.id,
      clarityScore: 5,
      accuracyScore: 5,
      usefulnessScore: 5,
      overallScore: 5,
      feedback: 'Incredible audio breakdown! The dialogue between Host and Researcher made attention mechanisms intuitive without dumbing down the mathematical rigor.',
      createdAt: '2026-09-29T09:15:00.000Z',
      userName: 'Dr. Elena Vance'
    };

    const historyItems: UserHistoryItem[] = [
      {
        id: 'hist_1',
        userId: demoUser.id,
        actionType: 'listened',
        paperId: paper1.id,
        podcastId: podcast1.id,
        title: 'Attention Is All You Need: The Breakthrough That Changed AI Forever',
        timestamp: new Date().toISOString(),
        metadata: { completionPercentage: 100 }
      },
      {
        id: 'hist_2',
        userId: demoUser.id,
        actionType: 'rated',
        podcastId: podcast1.id,
        title: 'Rated podcast 5 stars',
        timestamp: '2026-09-29T09:15:00.000Z'
      },
      {
        id: 'hist_3',
        userId: demoUser.id,
        actionType: 'generated',
        paperId: paper1.id,
        podcastId: podcast1.id,
        title: 'Generated 2-speaker AI Podcast for Attention Is All You Need',
        timestamp: '2026-09-28T14:25:30.000Z'
      },
      {
        id: 'hist_4',
        userId: demoUser.id,
        actionType: 'uploaded',
        paperId: paper1.id,
        title: 'Uploaded vaswani2017_attention.pdf (2.2 MB)',
        timestamp: '2026-09-28T14:20:00.000Z'
      }
    ];

    this.data.users = [demoUser];
    this.data.research_papers = [paper1];
    this.data.paper_sections = paper1Sections;
    this.data.podcasts = [podcast1];
    this.data.podcast_segments = podcast1Segments;
    this.data.evaluations = [eval1];
    this.data.ratings = [rating1];
    this.data.user_history = historyItems;
    this.data.search_history = [
      { id: 'sh_1', userId: demoUser.id, query: 'Transformers Attention', searchedAt: '2026-09-29T10:00:00.000Z' },
      { id: 'sh_2', userId: demoUser.id, query: 'Vaswani BLEU score', searchedAt: '2026-09-28T15:00:00.000Z' }
    ];
  }
}

export const db = new Database();
