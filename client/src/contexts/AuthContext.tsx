import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, AuthResponse } from '../types';
import { authApi } from '../api/authApi';
import { offlineQueue } from '../utils/offlineQueue';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('notely_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('notely_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync / Verify session on load
  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authApi.getMe();
        setUser(currentUser);
        localStorage.setItem('notely_user', JSON.stringify(currentUser));
      } catch (err) {
        console.error('Session verification failed:', err);
        setToken(null);
        setUser(null);
        localStorage.removeItem('notely_token');
        localStorage.removeItem('notely_user');
        queryClient.clear();
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, [token, queryClient]);

  const handleAuthSuccess = (data: AuthResponse) => {
    // Wipe previous cached user data from TanStack Query
    queryClient.clear();
    offlineQueue.clearQueue();

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('notely_token', data.token);
    localStorage.setItem('notely_user', JSON.stringify(data.user));
  };

  const login = async (credentials: { email: string; password: string }) => {
    const data = await authApi.login({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
    handleAuthSuccess(data);
    toast.success(`Welcome back, ${data.user.name}!`);
  };

  const register = async (credentials: { name: string; email: string; password: string }) => {
    const data = await authApi.register({
      name: credentials.name.trim(),
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
    handleAuthSuccess(data);
    toast.success(`Welcome to Notely, ${data.user.name}!`);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue cleanup even if server call fails
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('notely_token');
      localStorage.removeItem('notely_user');
      queryClient.clear();
      offlineQueue.clearQueue();
      toast.info('Signed out successfully');
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updated };
    setUser(newUser);
    localStorage.setItem('notely_user', JSON.stringify(newUser));
  };

  const refreshUser = async () => {
    try {
      const refreshed = await authApi.getMe();
      setUser(refreshed);
      localStorage.setItem('notely_user', JSON.stringify(refreshed));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
