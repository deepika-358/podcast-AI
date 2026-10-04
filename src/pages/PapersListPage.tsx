import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Search, 
  Calendar, 
  Sparkles,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchPaper } from '../types/index';
import { useToast } from '../context/ToastContext';

interface PapersListPageProps {
  navigate: (path: string) => void;
}

export const PapersListPage: React.FC<PapersListPageProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPapers();
      setPapers(res.papers);
    } catch (err: any) {
      showToast('Failed to load papers: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete paper "${title}"?`)) return;
    try {
      await api.deletePaper(id);
      showToast('Paper deleted.', 'success');
      fetchPapers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete paper', 'error');
    }
  };

  const filteredPapers = papers.filter(p => 
    p.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.authors.some(a => a.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            <span>My Research Papers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            All uploaded academic manuscripts with extracted sections and empirical findings.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-xl shadow-indigo-600/25 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Paper</span>
        </button>
      </div>

      {/* Search Filter */}
      {papers.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter papers by title or author..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading research papers...</span>
        </div>
      ) : papers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No research papers yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Upload your first academic manuscript in PDF format to start.
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
          >
            Upload Research Paper
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {paper.fileName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(paper.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3
                    onClick={() => navigate(`/papers/${paper.id}`)}
                    className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer leading-snug pt-1"
                  >
                    {paper.title}
                  </h3>

                  <p className="text-xs text-slate-400">
                    <strong>Authors:</strong> {paper.authors.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/papers/${paper.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
                  >
                    <span>View Sections</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(paper.id, paper.title)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Delete Paper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {paper.abstract}
              </p>

              {paper.keywords && paper.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {paper.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
