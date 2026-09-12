import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, AlertCircle, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEmailAlreadyRegistered, setIsEmailAlreadyRegistered] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (val: string) => {
    return /^\S+@\S+\.\S+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsEmailAlreadyRegistered(false);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. you@domain.com).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your confirm password.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ name: cleanName, email: cleanEmail, password });
      toast.success('Account created successfully! Welcome to Notely.');
      navigate('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Registration failed. Please check your information and try again.';

      setErrorMessage(msg);

      if (
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('already registered')
      ) {
        setIsEmailAlreadyRegistered(true);
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
          Create Account
        </h2>
        <p className="text-xs text-muted-foreground">
          Sign up to set up your personal knowledge workspace.
        </p>
      </div>

      {/* Dynamic Error / Helper Notice Banner */}
      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex items-start gap-3 text-xs text-destructive animate-in fade-in-50">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="font-medium leading-relaxed">{errorMessage}</p>
            {isEmailAlreadyRegistered && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/login`)
                }
                leftIcon={<LogIn className="h-3.5 w-3.5" />}
                className="text-xs border-destructive/40 text-foreground hover:bg-destructive/10"
              >
                Sign In to existing account
              </Button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Full Name
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="John Doe"
            leftIcon={<UserIcon className="h-4 w-4 text-muted-foreground" />}
            autoComplete="name"
            autoFocus={!initialEmail}
            required
          />
        </div>

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
            autoFocus={Boolean(initialEmail)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage && !isEmailAlreadyRegistered) setErrorMessage(null);
              }}
              placeholder="Minimum 6 characters"
              leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
              autoComplete="new-password"
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

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Confirm Password
          </label>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errorMessage && !isEmailAlreadyRegistered) setErrorMessage(null);
            }}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
            autoComplete="new-password"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full shadow-xs"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground pt-2 border-t border-border/50">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
