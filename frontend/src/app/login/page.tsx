'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Github, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

function UnifiedAuthPage() {  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams?.get('mode') === 'signup';
  
  const [isSignUp, setIsSignUp] = useState(initialMode);
  
  // Forms State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupTerms, setSignupTerms] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Validation State
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Refs for accessibility focus
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const signupFirstNameRef = useRef<HTMLInputElement>(null);

  // Initialize state based on URL, but don't force it to revert
  useEffect(() => {
    setIsSignUp(searchParams?.get('mode') === 'signup');
  }, [searchParams]);

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const handleLoginBlur = () => {
    if (loginEmail) setEmailError(validateEmail(loginEmail));
  };

  const handleSignupEmailBlur = () => {
    if (signupEmail) setEmailError(validateEmail(signupEmail));
  };

  const handleSignupPasswordBlur = () => {
    if (signupPassword) {
      setPasswordError(validatePassword(signupPassword));
      if (signupConfirmPassword && signupPassword !== signupConfirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  const handleSignupConfirmBlur = () => {
    if (signupConfirmPassword && signupPassword !== signupConfirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const togglePanel = (toSignUp: boolean) => {
    setIsSignUp(toSignUp);
    setToast(null);
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Manage focus for accessibility
    setTimeout(() => {
      if (toSignUp) {
        signupFirstNameRef.current?.focus();
        // optionally update URL without reload
        router.replace('/login?mode=signup', { scroll: false });
      } else {
        loginEmailRef.current?.focus();
        router.replace('/login', { scroll: false });
      }
    }, 100);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    const eError = validateEmail(loginEmail);
    if (eError) {
      setEmailError(eError);
      return;
    }
    
    if (!loginPassword) {
      setToast({ message: 'Please enter your password', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }
      
      localStorage.setItem('token', data.token);
      
      // On Success
      setToast({ message: 'Welcome back! Redirecting...', type: 'success' });
      setTimeout(() => router.push('/app/dashboard'), 800);
      
    } catch (error: any) {
      // On Error
      setToast({ message: error.message || 'An error occurred during login', type: 'error' });
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    const eError = validateEmail(signupEmail);
    const pError = validatePassword(signupPassword);
    
    if (eError) setEmailError(eError);
    if (pError) setPasswordError(pError);
    
    if (signupPassword !== signupConfirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    }

    if (eError || pError || signupPassword !== signupConfirmPassword) {
      return;
    }

    setLoading(true);

    try {
      // =====================================================================
      // TODO (Backend Integration): Replace block with actual signup request
      // =====================================================================
      /*
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName: signupFirstName,
          lastName: signupLastName,
          email: signupEmail, 
          password: signupPassword,
          acceptedTerms: signupTerms
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }
      
      // Store token (e.g., localStorage.setItem('token', data.token))
      */

      // Simulated Network Request
      await new Promise(resolve => setTimeout(resolve, 1200));

      // On Success
      setToast({ message: 'Account created successfully! Redirecting...', type: 'success' });
      setTimeout(() => router.push('/app/dashboard'), 800);
      
    } catch (error: any) {
      // On Error
      setToast({ message: error.message || 'An error occurred during signup', type: 'error' });
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'bg-transparent' };
    if (pass.length < 8) return { label: 'Weak', color: 'bg-auth-error' };
    if (pass.length >= 8 && /\d/.test(pass) && /[!@#$%^&*]/.test(pass)) return { label: 'Strong', color: 'bg-auth-success' };
    return { label: 'Medium', color: 'bg-auth-primary' };
  };

  const strength = getPasswordStrength(signupPassword);

  return (
    <div className="auth-page-bg flex min-h-screen items-center justify-center p-4 text-gray-800">
      
      {/* Aria-live region for accessibility announcements */}
      <div aria-live="assertive" className="sr-only">
        {toast ? toast.message : ''}
        {emailError || passwordError || confirmPasswordError}
      </div>

      <div className={`auth-wrapper w-full max-w-[900px] ${isSignUp ? 'right-panel-active' : ''}`}>
        
        {/* Toast Notification (absolute positioned over container) */}
        {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-up ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {toast.message}
          </div>
        )}

        <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`}>
          
          {/* Sign Up Panel */}
          <div className="auth-form-container sign-up-container bg-white">
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h1>
                <p className="mt-3 text-[1.1rem] text-gray-600 font-heading italic">
                  Create your account and keep your fleet flight-ready.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="sr-only">First Name</label>
                  <input
                    ref={signupFirstNameRef}
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={signupFirstName}
                    onChange={(e) => setSignupFirstName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[var(--auth-primary)] focus:bg-white transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="sr-only">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={signupLastName}
                    onChange={(e) => setSignupLastName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[var(--auth-primary)] focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signupEmail" className="sr-only">Email Address</label>
                <input
                  id="signupEmail"
                  type="email"
                  placeholder="Work Email"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={handleSignupEmailBlur}
                  className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:bg-white transition-colors ${emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--auth-primary)]'}`}
                  required
                />
                {emailError && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {emailError}</p>}
              </div>

              <div>
                <label htmlFor="signupPassword" className="sr-only">Password</label>
                <div className="relative">
                  <input
                    id="signupPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (min 8 chars)"
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    onBlur={handleSignupPasswordBlur}
                    className={`w-full rounded-xl border bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-900 outline-none focus:bg-white transition-colors ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--auth-primary)]'}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {passwordError}</p>}
                
                {/* Password Strength Indicator */}
                {signupPassword && !passwordError && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strength.label === 'Weak' ? 'w-1/3 bg-red-400' : strength.label === 'Medium' ? 'w-2/3 bg-yellow-400' : 'w-full bg-emerald-400'} transition-all duration-300`}
                      />
                    </div>
                    <span className="text-[10px] uppercase font-medium text-gray-500">{strength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="signupConfirm" className="sr-only">Confirm Password</label>
                <input
                  id="signupConfirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={signupConfirmPassword}
                  onChange={(e) => {
                    setSignupConfirmPassword(e.target.value);
                    if (confirmPasswordError) setConfirmPasswordError('');
                  }}
                  onBlur={handleSignupConfirmBlur}
                  className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:bg-white transition-colors ${confirmPasswordError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--auth-primary)]'}`}
                  required
                />
                {confirmPasswordError && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {confirmPasswordError}</p>}
              </div>

              <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={signupTerms}
                  onChange={(e) => setSignupTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[var(--auth-primary)] focus:ring-[var(--auth-primary)]"
                  required
                />
                <span>
                  I agree to the <Link href="#" className="text-[var(--auth-primary)] hover:underline">Terms</Link> and <Link href="#" className="text-[var(--auth-primary)] hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !!emailError || !!passwordError || !!confirmPasswordError || !signupTerms}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign Up'
                )}
              </button>

              {/* Mobile toggle link */}
              <div className="mt-4 text-center md:hidden">
                <button type="button" onClick={() => togglePanel(false)} className="text-sm text-gray-500 hover:text-gray-900">
                  Already have an account? <span className="text-[var(--auth-primary)] font-medium">Sign In</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sign In Panel */}
          <div className="auth-form-container sign-in-container bg-white">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
                <p className="mt-3 text-[1.1rem] text-gray-600 font-heading italic">
                  Join AeroGuard — inspections, compliance, and MRO in one place.
                </p>
              </div>

              <div className="flex gap-3 justify-center mb-6">
                <button type="button" className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center flex-1 text-gray-700 font-medium text-sm gap-2">
                  <Github className="w-5 h-5" />
                  GitHub
                </button>
                <button type="button" className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center flex-1 text-gray-700 font-medium text-sm gap-2">
                  <Mail className="w-5 h-5" />
                  Google
                </button>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-gray-400 uppercase tracking-wider">or sign in with email</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <label htmlFor="loginEmail" className="sr-only">Email Address</label>
                <input
                  ref={loginEmailRef}
                  id="loginEmail"
                  type="email"
                  placeholder="Email Address"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={handleLoginBlur}
                  className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:bg-white transition-colors ${emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--auth-primary)]'}`}
                  required
                />
                {emailError && !isSignUp && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {emailError}</p>}
              </div>

              <div>
                <label htmlFor="loginPassword" className="sr-only">Password</label>
                <div className="relative">
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-900 outline-none focus:border-[var(--auth-primary)] focus:bg-white transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[var(--auth-primary)] focus:ring-[var(--auth-primary)]"
                  />
                  Remember me
                </label>
                <button 
                  type="button" 
                  onClick={() => setToast({ message: 'Check your inbox for reset instructions.', type: 'success' })}
                  className="text-xs font-medium text-[var(--auth-primary)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !!emailError}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Mobile toggle link */}
              <div className="mt-4 text-center md:hidden">
                <button type="button" onClick={() => togglePanel(true)} className="text-sm text-gray-500 hover:text-gray-900">
                  Don&apos;t have an account? <span className="text-[var(--auth-primary)] font-medium">Sign Up</span>
                </button>
              </div>
            </form>
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
      </div>
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
