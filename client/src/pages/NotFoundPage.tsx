import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page or note you are looking for does not exist or has been moved.
      </p>
      <Button
        onClick={() => navigate('/')}
        leftIcon={<ArrowLeft className="h-4 w-4" />}
        size="sm"
      >
        Back to Dashboard
      </Button>
    </div>
  );
}
