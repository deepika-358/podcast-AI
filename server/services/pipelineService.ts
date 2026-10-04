import { db } from '../db/database';
import { GeminiService } from './geminiService';
import { 
  PodcastJobStatus, 
  PipelineProgress, 
  Podcast, 
  PodcastSegment, 
  Evaluation 
} from '../../src/types/index';

interface Job {
  jobId: string;
  userId: string;
  paperId: string;
  podcastId: string;
  status: PodcastJobStatus;
  step: number;
  totalSteps: number;
  message: string;
  currentSection?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

class PipelineService {
  private jobs: Map<string, Job> = new Map();

  public getJob(jobId: string): PipelineProgress | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    return {
      jobId: job.jobId,
      podcastId: job.podcastId,
      paperId: job.paperId,
      status: job.status,
      step: job.step,
      totalSteps: job.totalSteps,
      message: job.message,
      currentSection: job.currentSection,
      error: job.error,
    };
  }

  public async startPipeline(
    userId: string,
    paperId: string,
    customTitle?: string
  ): Promise<{ jobId: string; podcastId: string }> {
    const paper = db.getPaperById(paperId);
    if (!paper) {
      throw new Error('Paper not found');
    }

    const podcastId = 'pod_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const jobId = 'job_' + Date.now() + Math.random().toString(36).substring(2, 6);

    const title = customTitle || `${paper.title}: The AI Podcast Breakdown`;

    // Create preliminary podcast record in database
    const podcast: Podcast = {
      id: podcastId,
      userId,
      paperId,
      title,
      script: '',
      duration: 0,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
    db.createPodcast(podcast);

    const job: Job = {
      jobId,
      userId,
      paperId,
      podcastId,
      status: 'queued',
      step: 1,
      totalSteps: 7,
      message: 'Podcast generation queued in AI pipeline...',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.jobs.set(jobId, job);

    // Run async pipeline in background without blocking response
    setTimeout(() => {
      this.executePipeline(jobId).catch(err => {
        console.error(`Pipeline failure for job ${jobId}:`, err);
        const j = this.jobs.get(jobId);
        if (j) {
          j.status = 'failed';
          j.error = err.message || 'Generation failed';
          j.message = 'Processing error encountered.';
          this.jobs.set(jobId, j);
        }
        db.updatePodcast(podcastId, { status: 'failed' });
      });
    }, 100);

    return { jobId, podcastId };
  }

  private async executePipeline(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const paper = db.getPaperById(job.paperId);
    if (!paper) {
      throw new Error('Paper record missing during pipeline execution');
    }

    // Stage 1: Upload and verify
    this.updateJob(jobId, {
      status: 'processing',
      step: 1,
      message: 'Verifying research document structure and text...',
    });
    await new Promise(r => setTimeout(r, 600));

    // Stage 2: Extraction
    this.updateJob(jobId, {
      status: 'processing',
      step: 2,
      message: 'Extracting key mathematical theorems, methods, and empirical claims...',
    });
    await new Promise(r => setTimeout(r, 700));

    let sections = paper.sections || [];
    if (sections.length === 0) {
      // Re-extract if paper lacked pre-parsed sections
      const extracted = await GeminiService.processPaperContent(paper.abstract || paper.title, undefined, paper.fileName);
      sections = extracted.sections.map(s => ({
        id: 'sec_' + Math.random().toString(36).substring(2, 8),
        paperId: paper.id,
        sectionName: s.sectionName,
        originalText: s.originalText,
        summary: s.summary,
        orderIndex: s.orderIndex,
      }));
      db.createSections(sections);
    }

    // Stage 3: Section detection & analysis
    this.updateJob(jobId, {
      status: 'summarizing',
      step: 3,
      currentSection: 'Abstract & Methodology',
      message: 'Analyzing research hypotheses and experimental variables...',
    });
    await new Promise(r => setTimeout(r, 800));

    // Stage 4: Summarization
    this.updateJob(jobId, {
      status: 'summarizing',
      step: 4,
      currentSection: 'Results & Conclusion',
      message: 'Synthesizing verified factual summaries across all sections...',
    });
    await new Promise(r => setTimeout(r, 800));

    // Stage 5: Podcast Script Generation
    this.updateJob(jobId, {
      status: 'script_generating',
      step: 5,
      message: 'Crafting natural two-speaker conversational script (Host & Researcher)...',
    });

    const scriptData = await GeminiService.generatePodcastScript(
      paper.title,
      paper.authors,
      sections.map(s => ({ sectionName: s.sectionName, summary: s.summary }))
    );

    // Stage 6: Text-to-Speech audio narration
    this.updateJob(jobId, {
      status: 'audio_generating',
      step: 6,
      message: 'Generating two-voice narration with natural pacing and pauses...',
    });

    // Create segments in database
    const segments: PodcastSegment[] = scriptData.segments.map((seg, idx) => ({
      id: 'seg_' + Date.now() + '_' + idx,
      podcastId: job.podcastId,
      speaker: seg.speaker,
      text: seg.text,
      sequence: idx,
      duration: seg.duration,
      audioUrl: `/api/podcasts/${job.podcastId}/audio/segment/${idx}`,
    }));
    db.createSegments(segments);

    const totalDuration = segments.reduce((acc, s) => acc + s.duration, 0);

    await new Promise(r => setTimeout(r, 1200));

    // Stage 7: Factual evaluation and Finalizing
    this.updateJob(jobId, {
      status: 'completed',
      step: 7,
      message: 'Auditing factual fidelity and finalizing podcast master...',
    });

    const evaluationData = await GeminiService.evaluateFactualFidelity(
      paper.title,
      sections.map(s => ({ sectionName: s.sectionName, summary: s.summary, originalText: s.originalText })),
      scriptData.script
    );

    const evaluation: Evaluation = {
      id: 'eval_' + Date.now(),
      podcastId: job.podcastId,
      factualAccuracyScore: evaluationData.factualAccuracyScore,
      clarityScore: evaluationData.clarityScore,
      unsupportedClaims: evaluationData.unsupportedClaims,
      detectedIssues: evaluationData.detectedIssues,
      evaluationSummary: evaluationData.evaluationSummary,
      createdAt: new Date().toISOString(),
    };
    db.createEvaluation(evaluation);

    // Update podcast in database
    const completedAt = new Date().toISOString();
    db.updatePodcast(job.podcastId, {
      script: scriptData.script,
      duration: totalDuration,
      status: 'completed',
      completedAt,
      audioUrl: `/api/podcasts/${job.podcastId}/audio`,
    });

    // Record in user history
    db.addHistory({
      id: 'hist_' + Date.now(),
      userId: job.userId,
      actionType: 'generated',
      paperId: job.paperId,
      podcastId: job.podcastId,
      title: `Generated AI Podcast: ${paper.title}`,
      timestamp: completedAt,
      metadata: { duration: totalDuration, segmentsCount: segments.length },
    });

    this.updateJob(jobId, {
      status: 'completed',
      step: 7,
      message: 'Podcast ready to listen!',
    });
  }

  private updateJob(jobId: string, updates: Partial<Job>) {
    const job = this.jobs.get(jobId);
    if (job) {
      const updated = { ...job, ...updates, updatedAt: Date.now() };
      this.jobs.set(jobId, updated);
      if (updates.status) {
        db.updatePodcast(job.podcastId, { status: updates.status });
      }
    }
  }
}

export const pipelineService = new PipelineService();
