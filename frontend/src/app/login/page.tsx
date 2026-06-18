'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/app/dashboard');
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      {/* Background grid */}
      <div className="grid-overlay fixed inset-0 pointer-events-none opacity-40" />

      {/* Radial glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[400px] animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            A
          </div>
          <h1 className="text-[22px] font-medium text-text-primary" style={{ letterSpacing: '-0.015em' }}>
            Welcome back
          </h1>
          <p className="mt-1 text-[13px] text-text-secondary">
            Sign in to your AeroGuard account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@airline.com"
              className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 pr-10 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[12px] text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-border-default bg-elevated accent-accent"
              />
              Remember me
            </label>
            <a href="#" className="text-[12px] text-accent hover:text-accent-hover transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-accent hover:text-accent-hover transition-colors">
            Request access
          </Link>
        </p>
      </div>
    </div>
  );
}
