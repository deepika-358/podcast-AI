import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Volume2, 
  Bell, 
  Sliders, 
  Save,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, logout, updateUserPreferences } = useAuth();
  const { showToast } = useToast();

  const [hostVoice, setHostVoice] = useState(user?.preferences?.hostVoice || 'Puck');
  const [researcherVoice, setResearcherVoice] = useState(user?.preferences?.researcherVoice || 'Kore');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(user?.preferences?.theme || 'dark');
  const [audioSpeed, setAudioSpeed] = useState<number>(user?.preferences?.audioSpeed || 1);
  const [emailNotifications, setEmailNotifications] = useState(user?.preferences?.emailNotifications ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserPreferences({
        hostVoice,
        researcherVoice,
        theme,
        audioSpeed,
        emailNotifications,
      });
      showToast('Profile & audio preferences updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update preferences', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UserIcon className="w-7 h-7 text-indigo-400" />
            <span>Profile & Account Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your audio studio preferences, voices, and account credentials.
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/40 transition-colors w-fit"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* User Information Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-xl"
          />

          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize font-semibold">
                {user.role}
              </span>
            </div>

            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{user.email}</span>
            </p>

            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since: {new Date(user.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Audio & System Preferences Form */}
      <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-xl space-y-6">
        
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>Podcast Narration Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Host Voice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Host Persona Voice (Speaker 1)
            </label>
            <select
              value={hostVoice}
              onChange={(e) => setHostVoice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Puck">Puck (Enthusiastic, Bright News Anchor)</option>
              <option value="Fenrir">Fenrir (Deep, Articulate Radio Voice)</option>
              <option value="Charon">Charon (Measured, Authoritative)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">Interviewer & question guide persona</p>
          </div>

          {/* Researcher Voice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Researcher Persona Voice (Speaker 2)
            </label>
            <select
              value={researcherVoice}
              onChange={(e) => setResearcherVoice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Kore">Kore (Articulate, Expressive Specialist)</option>
              <option value="Zephyr">Zephyr (Warm, Scholarly Tone)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">Domain scientist explaining empirical findings</p>
          </div>

          {/* Default Playback Speed */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Playback Speed
            </label>
            <select
              value={audioSpeed}
              onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="0.75">0.75x (Detailed study)</option>
              <option value="1">1.0x (Standard)</option>
              <option value="1.25">1.25x (Accelerated)</option>
              <option value="1.5">1.5x (Speed listening)</option>
              <option value="2">2.0x (Rapid overview)</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Studio Color Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="dark">Dark Slate Studio (Default)</option>
              <option value="system">System Synchronized</option>
            </select>
          </div>

        </div>

        {/* Notifications Checkbox */}
        <div className="pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            <span>Email me when long-running research papers finish podcast generation</span>
          </label>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-md transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
