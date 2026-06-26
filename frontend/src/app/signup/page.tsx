'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push('/app/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="grid-overlay fixed inset-0 pointer-events-none opacity-40" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[400px] animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            A
          </div>
          <h1 className="text-[22px] font-medium text-text-primary" style={{ letterSpacing: '-0.015em' }}>
            Request Access
          </h1>
          <p className="mt-1 text-[13px] text-text-secondary">
            Create your AeroGuard enterprise account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Rivera"
                className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="org" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">
              Organization
            </label>
            <input
              id="org"
              type="text"
              placeholder="Lufthansa Technik"
              className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent"
              required
            />
          </div>

          <div>
            <label htmlFor="signupEmail" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">
              Work Email
            </label>
            <input
              id="signupEmail"
              type="email"
              placeholder="john@airline.com"
              className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent"
              required
            />
          </div>

          <div>
            <label htmlFor="signupPassword" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">
              Password
            </label>
            <input
              id="signupPassword"
              type="password"
              placeholder="Min 12 characters"
              className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent"
              required
              minLength={12}
            />
          </div>

          <label className="flex items-start gap-2 text-[12px] text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-3.5 w-3.5 rounded border-border-default bg-elevated accent-accent"
              required
            />
            <span>
              I agree to the{' '}
              <a href="#" className="text-accent hover:text-accent-hover">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-accent hover:text-accent-hover">Privacy Policy</a>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:text-accent-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
