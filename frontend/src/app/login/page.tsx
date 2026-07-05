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
      router.replace('/app/dashboard');
    }
  }, [isLoaded, userId, router]);
  
  const [isSignUp, setIsSignUp] = useState(initialMode);
  
  const togglePanel = (toSignUp: boolean) => {
    setIsSignUp(toSignUp);
    
    setTimeout(() => {
      if (toSignUp) {
        router.replace('/login?mode=signup', { scroll: false });
      } else {
        router.replace('/login', { scroll: false });
      }
    }, 100);
  };

  useEffect(() => {
    setIsSignUp(searchParams?.get('mode') === 'signup');
  }, [searchParams]);

  return (
    <div className="auth-page-bg flex min-h-screen items-center justify-center p-4 text-gray-800">
      
      <motion.div 
        initial={{ x: isSignUp ? '100vw' : '-100vw' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`auth-wrapper w-full max-w-[900px] ${isSignUp ? 'right-panel-active' : ''}`}
      >

        <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`}>
          
          {/* Sign Up Panel */}
          <div className="auth-form-container sign-up-container bg-white">
            <div className="flex h-full w-full items-center justify-center pt-8 md:pt-0 overflow-y-auto">
              <SignUp 
                appearance={{ elements: { rootBox: "w-full flex justify-center", card: "shadow-none border-0 m-0" } }} 
                routing="hash" 
                fallbackRedirectUrl="/app/dashboard"
                signInFallbackRedirectUrl="/app/dashboard"
              />
            </div>
            {/* Mobile toggle link */}
            <div className="absolute bottom-2 left-0 w-full text-center md:hidden z-10 bg-white/90 py-2">
              <button type="button" onClick={() => togglePanel(false)} className="text-sm text-gray-500 hover:text-gray-900">
                Already have an account? <span className="text-[var(--auth-primary)] font-medium">Sign In</span>
              </button>
            </div>
          </div>

          {/* Sign In Panel */}
          <div className="auth-form-container sign-in-container bg-white">
            <div className="flex h-full w-full items-center justify-center pt-8 md:pt-0 overflow-y-auto">
              <SignIn 
                appearance={{ elements: { rootBox: "w-full flex justify-center", card: "shadow-none border-0 m-0" } }} 
                routing="hash" 
                fallbackRedirectUrl="/app/dashboard"
                signUpFallbackRedirectUrl="/app/dashboard"
              />
            </div>
            {/* Mobile toggle link */}
            <div className="absolute bottom-2 left-0 w-full text-center md:hidden z-10 bg-white/90 py-2">
              <button type="button" onClick={() => togglePanel(true)} className="text-sm text-gray-500 hover:text-gray-900">
                Don&apos;t have an account? <span className="text-[var(--auth-primary)] font-medium">Sign Up</span>
              </button>
            </div>
          </div>

          {/* Overlay Container (Hidden on mobile) */}
          <div className="auth-overlay-container hidden md:block">
            <div className="auth-overlay">
              
              {/* Left Overlay (Shown when signing up) */}
              <div className="auth-overlay-panel auth-overlay-left">
                <h2 className="text-3xl font-bold mb-4">Ready for Your Next Inspection?</h2>
                <p className="text-sm mb-8 px-4 text-white/90 leading-relaxed">
                  Access aircraft inspections, maintenance records, compliance, and MRO workflows from one unified platform.
                </p>
                <button
                  onClick={() => togglePanel(false)}
                  className="rounded-xl border-2 border-white px-12 py-3 text-sm font-semibold text-white hover:bg-white hover:text-[var(--auth-primary)] transition-colors"
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
                  className="rounded-xl border-2 border-white px-12 py-3 text-sm font-semibold text-white hover:bg-white hover:text-[var(--auth-primary)] transition-colors"
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
