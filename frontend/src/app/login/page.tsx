'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Github, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { SignIn, SignUp, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';

function UnifiedAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams?.get('mode') === 'signup';
  const { isLoaded, userId } = useAuth();
  
  useEffect(() => {
    if (isLoaded && userId) {
      window.location.href = '/app/dashboard';
    }
  }, [isLoaded, userId]);
  
  const [isSignUp, setIsSignUp] = useState(initialMode);
  const [resetKey, setResetKey] = useState(0);
  
  const togglePanel = (toSignUp: boolean) => {
    // Increment key to force Clerk to re-mount with a fresh state
    setResetKey(prev => prev + 1);
    setIsSignUp(toSignUp);
    
    // Clear Clerk's hash state so it doesn't resume a stale flow
    // Use requestAnimationFrame to ensure state updates first
    requestAnimationFrame(() => {
      window.history.replaceState(
        null, 
        '', 
        toSignUp ? '/login?mode=signup' : '/login'
      );
    });
  };

  useEffect(() => {
    setIsSignUp(searchParams?.get('mode') === 'signup');
  }, [searchParams]);

  return (
    <div className="auth-page-bg flex min-h-screen flex-col px-2 py-8 md:p-4 text-gray-800">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`auth-wrapper m-auto w-full max-w-[900px] ${isSignUp ? 'right-panel-active' : ''}`}
      >

        <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`}>
          
          {/* Sign Up Panel */}
          <div className="auth-form-container sign-up-container bg-white flex flex-col">
            <div className="w-full text-center pt-2 pb-2 md:pt-6 px-4">
              <p className="text-xl md:text-2xl text-gray-900" style={{ fontFamily: "'Berkshire Swash', cursive", lineHeight: "1.3" }}>
                Join the future of aircraft inspection — smarter, faster, safer.
              </p>
            </div>
            <div className="flex h-full w-full items-center justify-center overflow-y-auto">
              {isSignUp && (
                <SignUp 
                  key={`signup-${resetKey}`}
                  appearance={{ elements: { rootBox: "w-full flex justify-center", card: "shadow-none border-0 m-0 w-full max-w-full", footerAction: "hidden" } }} 
                  routing="hash" 
                  signInUrl="/login"
                  fallbackRedirectUrl="/app/dashboard"
                  forceRedirectUrl="/app/dashboard"
                />
              )}
            </div>
            {/* Mobile toggle link */}
            <div className="relative w-full text-center md:hidden z-10 pb-4 pt-2">
              <button type="button" onClick={() => togglePanel(false)} className="text-sm text-gray-500 hover:text-gray-900 font-medium">
                Already have an account? <span className="text-[var(--auth-primary)]">Sign In</span>
              </button>
            </div>
          </div>

          {/* Sign In Panel */}
          <div className="auth-form-container sign-in-container bg-white flex flex-col">
            <div className="w-full text-center pt-2 pb-2 md:pt-6 px-4">
              <p className="text-2xl md:text-3xl text-gray-900" style={{ fontFamily: "'Berkshire Swash', cursive", lineHeight: "1.3" }}>
                Welcome back to smarter inspections.
              </p>
            </div>
            <div className="flex h-full w-full items-center justify-center overflow-y-auto">
              {!isSignUp && (
                <SignIn 
                  key={`signin-${resetKey}`}
                  appearance={{ elements: { rootBox: "w-full flex justify-center", card: "shadow-none border-0 m-0 w-full max-w-full", footerAction: "hidden" } }} 
                  routing="hash" 
                  signUpUrl="/login?mode=signup"
                  fallbackRedirectUrl="/app/dashboard"
                  forceRedirectUrl="/app/dashboard"
                />
              )}
            </div>
            {/* Mobile toggle link */}
            <div className="relative w-full text-center md:hidden z-10 pb-4 pt-2">
              <button type="button" onClick={() => togglePanel(true)} className="text-sm text-gray-500 hover:text-gray-900 font-medium">
                Don&apos;t have an account? <span className="text-[var(--auth-primary)]">Sign Up</span>
              </button>
            </div>
          </div>

          {/* Overlay Container (Hidden on mobile) */}
          <div className="auth-overlay-container">
            <div className="auth-overlay">
              
              {/* Left Overlay (Shown when signing up) */}
              <div className="auth-overlay-panel auth-overlay-left">
                <h2 className="text-3xl font-bold mb-4">Ready for Your Next Inspection?</h2>
                <p className="text-sm mb-8 px-4 text-white/90 leading-relaxed">
                  Access aircraft inspections, maintenance records, compliance, and MRO workflows from one unified platform.
                </p>
                <button
                  onClick={() => togglePanel(false)}
                  aria-label="Switch to sign in"
                  className="rounded-xl border-2 border-white/80 px-12 py-3 text-sm font-semibold text-white backdrop-blur-sm
                    hover:bg-white hover:text-[var(--auth-primary)] hover:border-white
                    active:scale-95 transition-all duration-300"
                >
                  Sign In
                </button>
              </div>
              
              {/* Right Overlay (Shown when signing in) */}
              <div className="auth-overlay-panel auth-overlay-right">
                <h2 className="text-3xl font-bold mb-4">New Here?</h2>
                <p className="text-sm mb-8 px-4 text-white/90 leading-relaxed">
                  Create an account to access advanced fleet analytics and maintenance tracking.
                </p>
                <button
                  onClick={() => togglePanel(true)}
                  aria-label="Switch to sign up"
                  className="rounded-xl border-2 border-white/80 px-12 py-3 text-sm font-semibold text-white backdrop-blur-sm
                    hover:bg-white hover:text-[var(--auth-primary)] hover:border-white
                    active:scale-95 transition-all duration-300"
                >
                  Sign Up
                </button>
              </div>

            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center"><span className="w-8 h-8 border-4 border-[var(--auth-primary)] border-t-transparent rounded-full animate-spin"></span></div>}>
      <UnifiedAuthPage />
    </React.Suspense>
  );
}
