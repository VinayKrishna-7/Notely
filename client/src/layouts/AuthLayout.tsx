import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotelyLogo } from '../components/common/NotelyLogo';

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <NotelyLogo size="lg" showText={false} className="animate-pulse" />
          <p className="text-xs text-muted-foreground font-medium">Loading Notely...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 flex flex-col items-center">
        <NotelyLogo size="xl" className="mb-2" />
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Capture ideas. Organize everything. Find anything.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-card py-8 px-6 sm:px-10 shadow-xl border border-border rounded-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
