/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalAudioPlayer } from './components/GlobalAudioPlayer';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPaperPage } from './pages/UploadPaperPage';
import { PapersListPage } from './pages/PapersListPage';
import { PaperDetailPage } from './pages/PaperDetailPage';
import { PodcastsListPage } from './pages/PodcastsListPage';
import { PodcastDetailPage } from './pages/PodcastDetailPage';
import { SearchPage } from './pages/SearchPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const renderCurrentRoute = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-400">Initializing PaperCast AI Studio...</p>
          </div>
        </div>
      );
    }

    // Public Routes
    if (currentPath === '/') {
      return <LandingPage navigate={navigate} />;
    }
    if (currentPath === '/login' || currentPath === '/forgot-password') {
      if (user) {
        navigate('/dashboard');
        return <DashboardPage navigate={navigate} />;
      }
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/register') {
      if (user) {
        navigate('/dashboard');
        return <DashboardPage navigate={navigate} />;
      }
      return <RegisterPage navigate={navigate} />;
    }

    // Protected Routes Check
    if (!user) {
      return <LoginPage navigate={navigate} />;
    }

    // Exact Private Routes
    if (currentPath === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }
    if (currentPath === '/upload') {
      return <UploadPaperPage navigate={navigate} />;
    }
    if (currentPath === '/papers') {
      return <PapersListPage navigate={navigate} />;
    }
    if (currentPath === '/podcasts') {
      return <PodcastsListPage navigate={navigate} />;
    }
    if (currentPath === '/search') {
      return <SearchPage navigate={navigate} />;
    }
    if (currentPath === '/history') {
      return <HistoryPage navigate={navigate} />;
    }
    if (currentPath === '/profile' || currentPath === '/settings') {
      return <ProfilePage navigate={navigate} />;
    }

    // Dynamic Routes: /papers/:id
    if (currentPath.startsWith('/papers/')) {
      const id = currentPath.replace('/papers/', '');
      return <PaperDetailPage paperId={id} navigate={navigate} />;
    }

    // Dynamic Routes: /podcasts/:id
    if (currentPath.startsWith('/podcasts/')) {
      const id = currentPath.replace('/podcasts/', '');
      return <PodcastDetailPage podcastId={id} navigate={navigate} />;
    }

    // Default fallback to Landing or Dashboard
    return user ? <DashboardPage navigate={navigate} /> : <LandingPage navigate={navigate} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar currentPath={currentPath} navigate={navigate} />
      
      <main className="flex-1 pb-24">
        {renderCurrentRoute()}
      </main>

      <Footer navigate={navigate} />

      {/* Global persistent audio bar */}
      <GlobalAudioPlayer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AudioPlayerProvider>
    </AuthProvider>
  );
}
