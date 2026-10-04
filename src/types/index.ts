export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: 'researcher' | 'student' | 'academic' | 'general';
  createdAt: string;
  lastLogin: string;
  preferences?: {
    theme?: 'dark' | 'light' | 'system';
    hostVoice?: string;
    researcherVoice?: string;
    audioSpeed?: number;
    emailNotifications?: boolean;
  };
}

export type SectionType = 
  | 'abstract' 
  | 'introduction' 
  | 'methodology' 
  | 'results' 
  | 'discussion' 
  | 'conclusion' 
  | 'references';

export interface PaperSection {
  id: string;
  paperId: string;
  sectionName: SectionType | string;
  originalText: string;
  summary: string;
  orderIndex: number;
}

export interface ResearchPaper {
  id: string;
  userId: string;
  title: string;
  authors: string[];
  abstract: string;
  fileUrl?: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  publicationDate?: string;
  keywords: string[];
  processingStatus: 'uploaded' | 'processing' | 'completed' | 'failed';
  sections?: PaperSection[];
  podcastId?: string;
}

export interface PodcastSegment {
  id: string;
  podcastId: string;
  speaker: 'Host' | 'Researcher';
  text: string;
  audioUrl?: string;
  sequence: number;
  duration: number; // in seconds
}

export type PodcastJobStatus = 
  | 'queued' 
  | 'processing' 
  | 'summarizing' 
  | 'script_generating' 
  | 'audio_generating' 
  | 'completed' 
  | 'failed';

export interface Podcast {
  id: string;
  userId: string;
  paperId: string;
  title: string;
  script: string;
  audioUrl?: string;
  duration: number; // total duration in seconds
  status: PodcastJobStatus;
  createdAt: string;
  completedAt?: string;
  paperTitle?: string;
  paperAuthors?: string[];
  segments?: PodcastSegment[];
  evaluation?: Evaluation;
  ratingAverage?: number;
  ratingsCount?: number;
}

export interface Rating {
  id: string;
  userId: string;
  podcastId: string;
  clarityScore: number; // 1-5
  accuracyScore: number; // 1-5
  usefulnessScore: number; // 1-5
  overallScore: number; // 1-5
  feedback?: string;
  createdAt: string;
  userName?: string;
}

export type ActionType = 'uploaded' | 'viewed' | 'generated' | 'listened' | 'rated' | 'searched';

export interface UserHistoryItem {
  id: string;
  userId: string;
  actionType: ActionType;
  paperId?: string;
  podcastId?: string;
  title?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  searchedAt: string;
}

export interface DetectedIssue {
  type: 'unsupported_claim' | 'numerical_drift' | 'omission' | 'simplification' | 'verified_accurate';
  severity: 'low' | 'medium' | 'high' | 'info';
  quote: string;
  sourceContext: string;
  explanation: string;
}

export interface Evaluation {
  id: string;
  podcastId: string;
  factualAccuracyScore: number; // e.g. 94%
  clarityScore: number; // e.g. 91%
  unsupportedClaims: number; // count
  detectedIssues: DetectedIssue[];
  evaluationSummary: string;
  createdAt: string;
}

export interface PipelineProgress {
  jobId: string;
  podcastId: string;
  paperId: string;
  status: PodcastJobStatus;
  step: number;
  totalSteps: number;
  message: string;
  currentSection?: string;
  error?: string;
}

export interface DashboardStats {
  totalPapers: number;
  totalPodcasts: number;
  totalListeningTime: number; // in seconds
  averageRating: number;
  recentPapers: ResearchPaper[];
  recentPodcasts: Podcast[];
  recentActivities: UserHistoryItem[];
}
