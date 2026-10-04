import React, { useState } from 'react';
import { 
  Headphones, 
  Sparkles, 
  BookOpen, 
  Mic, 
  Search, 
  History, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => handleNav(user ? '/dashboard' : '/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Headphones className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-sans">PaperCast</span>
                <span className="text-xs px-1.5 py-0.5 font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Research Papers. Spoken.</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {!user ? (
              <>
                <button 
                  onClick={() => handleNav('/')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/' ? 'text-white bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    handleNav('/');
                    setTimeout(() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => {
                    handleNav('/');
                    setTimeout(() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => {
                    handleNav('/');
                    setTimeout(() => {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  About
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleNav('/dashboard')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/dashboard' ? 'text-white bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Dashboard
                </button>
                <button 
                  onClick={() => handleNav('/papers')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/papers' ? 'text-white bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  My Papers
                </button>
                <button 
                  onClick={() => handleNav('/podcasts')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/podcasts' ? 'text-white bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  My Podcasts
                </button>
                <button 
                  onClick={() => handleNav('/search')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/search' ? 'text-white bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button 
                  onClick={() => handleNav('/history')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/history' ? 'text-white bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <button
                  onClick={demoLogin}
                  className="px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-lg transition-all"
                >
                  ⚡ Instant Demo
                </button>
                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="relative group inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-lg shadow-lg shadow-indigo-600/25 transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  Get Started
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('/upload')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 rounded-lg shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Podcast</span>
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-800/60 border border-slate-800 transition-all"
                  >
                    <img
                      src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/40"
                    />
                    <span className="text-sm font-medium text-slate-200 max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() => handleNav('/profile')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Profile & Settings
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          handleNav('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={() => handleNav('/upload')}
                className="p-2 text-indigo-400 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {!user ? (
            <>
              <button
                onClick={() => handleNav('/')}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Home
              </button>
              <button
                onClick={demoLogin}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30"
              >
                ⚡ Instant Demo Login
              </button>
              <button
                onClick={() => handleNav('/login')}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Login
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="w-full text-center px-4 py-2.5 rounded-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-slate-800 mb-2">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={() => handleNav('/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                <Layers className="w-5 h-5 text-indigo-400" />
                Dashboard
              </button>
              <button
                onClick={() => handleNav('/upload')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-indigo-300 bg-indigo-950/30 border border-indigo-500/20"
              >
                <Plus className="w-5 h-5 text-indigo-400" />
                + Create New Podcast
              </button>
              <button
                onClick={() => handleNav('/papers')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                <BookOpen className="w-5 h-5 text-indigo-400" />
                My Papers
              </button>
              <button
                onClick={() => handleNav('/podcasts')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                <Mic className="w-5 h-5 text-indigo-400" />
                My Podcasts
              </button>
              <button
                onClick={() => handleNav('/search')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                <Search className="w-5 h-5 text-indigo-400" />
                Search
              </button>
              <button
                onClick={() => handleNav('/history')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                <History className="w-5 h-5 text-indigo-400" />
                History
              </button>
              <button
                onClick={() => handleNav('/profile')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                <UserIcon className="w-5 h-5 text-indigo-400" />
                Profile & Settings
              </button>
              <button
                onClick={() => {
                  logout();
                  handleNav('/');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
