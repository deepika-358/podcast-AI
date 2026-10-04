import { 
  User, 
  ResearchPaper, 
  Podcast, 
  PipelineProgress, 
  Evaluation, 
  Rating, 
  UserHistoryItem, 
  SearchHistoryItem, 
  DashboardStats 
} from '../types/index';

const BASE_URL = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('papercast_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clear token on unauthorized if not login/register
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('papercast_token');
        localStorage.removeItem('papercast_user');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Network request failed');
    }

    return data;
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string, role?: string): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Papers
  async uploadPaper(payload: {
    rawText?: string;
    pdfBase64?: string;
    fileName: string;
    fileSize?: number;
    manualTitle?: string;
  }): Promise<{ paper: ResearchPaper; message: string }> {
    return this.request<{ paper: ResearchPaper; message: string }>('/papers/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPapers(): Promise<{ papers: ResearchPaper[] }> {
    return this.request<{ papers: ResearchPaper[] }>('/papers');
  }

  async getPaperById(id: string): Promise<{ paper: ResearchPaper }> {
    return this.request<{ paper: ResearchPaper }>(`/papers/${id}`);
  }

  async deletePaper(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/papers/${id}`, {
      method: 'DELETE',
    });
  }

  async seedSamplePaper(sampleType: 'alphafold' | 'generative-agents'): Promise<{ paper: ResearchPaper }> {
    return this.request<{ paper: ResearchPaper }>('/papers/seed-sample', {
      method: 'POST',
      body: JSON.stringify({ sampleType }),
    });
  }

  // Podcasts
  async generatePodcast(paperId: string, customTitle?: string): Promise<{ jobId: string; podcastId: string; message: string }> {
    return this.request<{ jobId: string; podcastId: string; message: string }>('/podcasts/generate', {
      method: 'POST',
      body: JSON.stringify({ paperId, customTitle }),
    });
  }

  async getJobProgress(jobId: string): Promise<{ job: PipelineProgress }> {
    return this.request<{ job: PipelineProgress }>(`/podcasts/jobs/${jobId}`);
  }

  async getPodcasts(): Promise<{ podcasts: Podcast[] }> {
    return this.request<{ podcasts: Podcast[] }>('/podcasts');
  }

  async getPodcastById(id: string): Promise<{ podcast: Podcast }> {
    return this.request<{ podcast: Podcast }>(`/podcasts/${id}`);
  }

  async deletePodcast(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/podcasts/${id}`, {
      method: 'DELETE',
    });
  }

  async recordListen(podcastId: string, completionPercentage: number = 100): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/podcasts/${podcastId}/record-listen`, {
      method: 'POST',
      body: JSON.stringify({ completionPercentage }),
    });
  }

  async getPodcastAudio(id: string): Promise<any> {
    return this.request<any>(`/podcasts/${id}/audio`);
  }

  // Evaluations
  async getEvaluation(podcastId: string): Promise<{ evaluation: Evaluation }> {
    return this.request<{ evaluation: Evaluation }>(`/evaluations/${podcastId}`);
  }

  // Ratings
  async submitRating(ratingData: {
    podcastId: string;
    clarityScore: number;
    accuracyScore: number;
    usefulnessScore: number;
    overallScore: number;
    feedback?: string;
  }): Promise<{ rating: Rating; message: string }> {
    return this.request<{ rating: Rating; message: string }>('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  async getRatings(podcastId: string): Promise<{ ratings: Rating[] }> {
    return this.request<{ ratings: Rating[] }>(`/ratings/${podcastId}`);
  }

  // Search
  async search(query: string, type: string = 'all', status: string = 'all'): Promise<{
    query: string;
    filterType: string;
    filterStatus: string;
    results: {
      papers: ResearchPaper[];
      podcasts: Podcast[];
      totalCount: number;
    };
    searchHistory: SearchHistoryItem[];
  }> {
    const params = new URLSearchParams({ q: query, type, status });
    return this.request(`/search?${params.toString()}`);
  }

  // History
  async getHistory(): Promise<{
    history: UserHistoryItem[];
    grouped: {
      today: UserHistoryItem[];
      yesterday: UserHistoryItem[];
      earlier: UserHistoryItem[];
    };
  }> {
    return this.request('/history');
  }

  async clearHistory(): Promise<{ message: string }> {
    return this.request('/history', {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalytics(): Promise<DashboardStats> {
    return this.request('/analytics');
  }
}

export const api = new ApiClient();
