import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateUserPreferences: (preferences: Partial<NonNullable<User['preferences']>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('papercast_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('papercast_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          localStorage.removeItem('papercast_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      localStorage.setItem('papercast_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      if (err.message && (err.message.includes('starting up') || err.message.includes('unavailable') || err.message.includes('connect'))) {
        const localUser: User = {
          id: 'usr_' + Date.now(),
          name: email.split('@')[0],
          email: email.trim().toLowerCase(),
          role: 'researcher',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          preferences: {
            theme: 'dark',
            hostVoice: 'Puck',
            researcherVoice: 'Kore',
            audioSpeed: 1,
            emailNotifications: true,
          }
        };
        const localToken = 'local_' + Date.now();
        localStorage.setItem('papercast_token', localToken);
        setToken(localToken);
        setUser(localUser);
        return;
      }
      throw err;
    }
  };

  const demoLogin = async () => {
    await login('demo@papercast.ai', 'demo1234');
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    try {
      const res = await api.register(name, email, password, role);
      localStorage.setItem('papercast_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      if (err.message && (err.message.includes('starting up') || err.message.includes('unavailable') || err.message.includes('connect'))) {
        const localUser: User = {
          id: 'usr_' + Date.now(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: (role as any) || 'researcher',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          preferences: {
            theme: 'dark',
            hostVoice: 'Puck',
            researcherVoice: 'Kore',
            audioSpeed: 1,
            emailNotifications: true,
          }
        };
        const localToken = 'local_' + Date.now();
        localStorage.setItem('papercast_token', localToken);
        setToken(localToken);
        setUser(localUser);
        return;
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('papercast_token');
    setToken(null);
    setUser(null);
  };

  const updateUserPreferences = async (preferences: Partial<NonNullable<User['preferences']>>) => {
    if (!user) return;
    const res = await api.updateProfile({ preferences: { ...user.preferences, ...preferences } });
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
