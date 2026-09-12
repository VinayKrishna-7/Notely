import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('notely_remembered_email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(() => {
    return Boolean(localStorage.getItem('notely_remembered_email'));
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUserNotFound, setIsUserNotFound] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (val: string) => {
    return /^\S+@\S+\.\S+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsUserNotFound(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. you@domain.com).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: cleanEmail, password });

      if (rememberEmail) {
        localStorage.setItem('notely_remembered_email', cleanEmail);
      } else {
        localStorage.removeItem('notely_remembered_email');
      }

      toast.success('Signed in successfully');
      navigate('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Unable to sign in. Please check your connection and credentials.';

      setErrorMessage(msg);

      if (
        msg.toLowerCase().includes('no account found') ||
        msg.toLowerCase().includes('user not found')
      ) {
        setIsUserNotFound(true);
      }

      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Sign In
        </h2>
        <p className="text-xs text-muted-foreground">
          Enter your credentials to access your workspace.
        </p>
      </div>

      {/* Dynamic Error / Helper Notice Banner */}
      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex items-start gap-3 text-xs text-destructive animate-in fade-in-50">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="font-medium leading-relaxed">{errorMessage}</p>
            {isUserNotFound && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/register?email=${encodeURIComponent(email.trim().toLowerCase())}`)
                }
                leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                className="text-xs border-destructive/40 text-foreground hover:bg-destructive/10"
              >
                Create new account with this email
              </Button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Email address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="you@domain.com"
            leftIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
            autoComplete="email"
            autoFocus={!email}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-foreground">
              Password
            </label>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage && !isUserNotFound) setErrorMessage(null);
              }}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
              autoComplete="current-password"
              autoFocus={Boolean(email)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-primary/30"
            />
            <span>Remember email</span>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full shadow-xs"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground pt-2 border-t border-border/50">
        Don't have an account yet?{' '}
        <Link
          to={`/register${email ? `?email=${encodeURIComponent(email.trim().toLowerCase())}` : ''}`}
          className="text-primary font-semibold hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
