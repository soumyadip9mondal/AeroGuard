'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NeuralBackground from '../components/shared/NeuralBackground';
import { Button as NeonButton } from '@/components/ui/neon-button';
import {
  ArrowRight,
  Upload,
  Cpu,
  Box,
  FileText,
  Package,
  Shield,
  ChevronRight,
  Play,
  Zap,
  Eye,
  BarChart3,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';

import { useUIStore } from '@/stores/ui.store';

/* ─── Scroll-aware Nav with mobile hamburger ─── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const setPendingRoute = useUIStore((state: any) => state.setPendingRoute);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile drawer on resize to desktop */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Close mobile drawer on outside click */
  useEffect(() => {
    if (!mobileOpen) return;
    const onClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [mobileOpen]);

  /* Prevent body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex h-[80px] items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-border-subtle shadow-sm'
          : 'bg-transparent'
          }`}
      >
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="AeroGuard Logo" className="h-14 w-14 sm:h-16 sm:w-16 object-contain drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          <span className="text-[22px] sm:text-[28px] font-bold text-text-primary tracking-wide">AeroGuard</span>
        </div>

        {/* Desktop nav links — hidden below lg */}
        <div className="hidden lg:flex items-center gap-3">
          <NeonButton onClick={() => { router.push('/signup'); }} variant="ghost" className="rounded-[16px] border border-[#CBD5E1] bg-white px-5 py-2 text-[15px] font-medium text-[#0F172A] transition-all duration-300 hover:bg-gray-50 hover:scale-105">
            Sign up
          </NeonButton>
          <NeonButton onClick={() => { router.push('/login'); }} variant="solid" className="rounded-[16px] bg-[#5D5FEF] px-5 py-2 text-[15px] font-medium text-white transition-all duration-300 hover:bg-[#4B4DD9] hover:scale-105">
            Log in
          </NeonButton>
        </div>

        {/* Hamburger button — visible below lg, 44×44px touch target */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex lg:hidden items-center justify-center h-[44px] w-[44px] rounded-md text-text-secondary hover:text-text-primary transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer — slides down below nav */}
      <div
        ref={drawerRef}
        className={`fixed top-[72px] left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-b border-border-subtle shadow-md transition-all duration-300 ${mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col gap-3 px-4 py-4">
          <NeonButton
            onClick={() => {
              setMobileOpen(false);
              router.push('/signup');
            }}
            variant="ghost"
            className="w-full rounded-[16px] border border-[#CBD5E1] bg-white px-4 py-3.5 text-[15px] font-medium text-[#0F172A] transition-all duration-300 hover:bg-gray-50 hover:scale-[1.02]"
          >
            Sign up
          </NeonButton>
          <NeonButton
            onClick={() => {
              setMobileOpen(false);
              router.push('/login');
            }}
            variant="solid"
            className="w-full rounded-[16px] bg-[#5D5FEF] px-4 py-3.5 text-[15px] font-medium text-white transition-all duration-300 hover:bg-[#4B4DD9] hover:scale-[1.02]"
          >
            Log in
          </NeonButton>
        </div>
      </div>
    </>
  );
}

/* ─── Hero Section ─── */
function Hero() {
  const setPendingRoute = useUIStore((state: any) => state.setPendingRoute);
  const [navigating, setNavigating] = useState<'trial' | 'demo' | null>(null);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2 + 0.3,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden py-20 lg:py-0">
      {/* Mesh Gradient Background */}
      <div className="landing-mesh-bg absolute inset-0 -z-10" />

      {/* Grid overlay */}
      <div className="grid-overlay absolute inset-0 pointer-events-none opacity-20" />

      {/* Responsive gap: tight on mobile, spacious on desktop */}
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col lg:flex-row items-center gap-8 lg:gap-16 px-4 sm:px-6 pt-[56px] z-10">
        {/* Left content */}
        <div className="flex-1 max-w-[560px]">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#274EF2]/20 bg-white px-3 py-1.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(39,78,242,0.15)] hover:border-[#274EF2]/40 cursor-default"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#274EF2] animate-pulse" />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#274EF2' }}>
              Aircraft Inspection AI
            </span>
          </motion.div>

          {/* Hero H1 — fluid typography via clamp() to prevent overflow on mobile */}
          <motion.h1
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-5 bg-clip-text text-transparent font-heading italic tracking-[-0.03em]"
            style={{
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(28px, 5.5vw, 52px)",
              lineHeight: 1.08,
              fontFamily: "var(--font-mileast)",
              backgroundImage: "linear-gradient(135deg, #1E3A6D 0%, #2F5F9F 30%, #559BD5 60%, #8FC5F7 85%, #D6C5FF 100%)",
            }}
          >
            AI-Powered
            <br />
            Aircraft Inspection
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 max-w-[460px] text-[17px] leading-[1.7] text-[#0F172A]"
          >
            Replace manual borescope video review with automated defect detection,
            3D digital twin visualization, and compliance reporting — all from one platform.
          </motion.p>

          {/* CTA buttons — stack vertically on mobile, row on sm+ */}
          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6"
          >
            <Link
              href="/signup"
              onClick={() => {
                setPendingRoute('/signup');
                setNavigating('trial');
              }}
              className="flex items-center justify-center gap-2 rounded-[12px] bg-accent px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-accent-hover shadow-md shadow-accent/20 w-full sm:w-auto min-w-[160px]"
            >
              {navigating === 'trial' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Link>
            <Link
              href="/login"
              onClick={() => {
                setPendingRoute('/login');
                setNavigating('demo');
              }}
              className="flex items-center justify-center gap-2 rounded-[12px] border border-accent bg-white px-6 py-3 text-[15px] font-medium text-accent transition-colors hover:bg-[#DAEFFF] w-full sm:w-auto min-w-[160px]"
            >
              {navigating === 'demo' ? (
                <>
                  <span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Watch Demo
                </>
              )}
            </Link>
          </motion.div>

          {/* Trust badges — flex-wrap so they never clip on narrow viewports */}
          <motion.div
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6 text-[13px] text-[#0F172A] font-medium"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-[18px] w-[18px] text-success" />
              FAA Compliant
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-[18px] w-[18px] text-success" />
              EASA Approved
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-[18px] w-[18px] text-success" />
              ISO 27001
            </span>
          </motion.div>
        </div>

        {/* Right — Pipeline diagram */}
        <motion.div
          custom={3}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex-1 max-w-[500px] lg:max-w-none lg:block"
        >
          <PipelineDiagram />
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Animated Pipeline Diagram ─── */
function PipelineDiagram() {
  // --- CONFIGURABLE DIMENSIONS ---
  // Change these numbers to adjust the box size. 
  // For a perfect 16:9 rectangle, use sizes like 960x540, 1280x720, or 640x360.
  const BOX_WIDTH = 1920;
  const BOX_HEIGHT = 1080;
  // -------------------------------

  const [activeStage, setActiveStage] = useState(0);
  const [phase, setPhase] = useState<'pipeline' | 'video'>('pipeline');
  const [currentVideo, setCurrentVideo] = useState(1);

  const stages = [
    { icon: Upload, label: 'Upload', detail: '4K Video' },
    { icon: Cpu, label: 'AI Detection', detail: '1,247 Frames' },
    { icon: Eye, label: 'Enhancement', detail: 'Super-Res' },
    { icon: Zap, label: 'Defect Analysis', detail: '3 Found' },
    { icon: Box, label: '3D Twin', detail: 'Heatmap' },
    { icon: FileText, label: 'Report', detail: 'Compliant' },
  ];

  useEffect(() => {
    if (phase !== 'pipeline') return;

    const interval = setInterval(() => {
      setActiveStage((prev: number) => {
        const next = prev + 1;
        if (next >= stages.length) {
          clearInterval(interval);
          setTimeout(() => setPhase('video'), 1000);
          return next;
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [stages.length, phase]);

  // We removed the flipping phase intermediate effect

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      whileHover={{ scale: 1.02 }}
      transition={{
        y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.3, ease: "easeOut" }
      }}
      className="relative overflow-hidden rounded-xl border border-slate-300 bg-surface/60 backdrop-blur-sm shadow-[0_12px_32px_rgba(36,92,146,0.15)] hover:shadow-[0_20px_48px_rgba(36,92,146,0.25)] transition-shadow duration-300 cursor-pointer mx-auto"
      style={{
        width: '100%',
        maxWidth: `${BOX_WIDTH}px`,
        height: 'auto',
        aspectRatio: `${BOX_WIDTH} / ${BOX_HEIGHT}`,
        perspective: '1200px'
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'pipeline' && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full w-full flex-col justify-center p-4 lg:p-6"
          >
            <div className="space-y-0.5 lg:space-y-2">
              {stages.map((stage, i) => {
                const Icon = stage.icon;
                const isActive = i === activeStage;
                const isComplete = i < activeStage;

                return (
                  <motion.div
                    key={stage.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
                    className={`flex items-center gap-1.5 sm:gap-3 rounded-lg border px-1.5 sm:px-3 py-0.5 sm:py-2 transition-all duration-500 ${isActive
                      ? 'border-[#2563EB]/40 bg-blue-50 shadow-sm shadow-blue-500/10'
                      : isComplete
                        ? 'border-slate-300 bg-surface/30'
                        : 'border-transparent bg-transparent'
                      }`}
                  >
                    <div
                      className={`flex h-4 w-4 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md transition-all duration-500 ${isActive
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/30'
                        : isComplete
                          ? 'bg-[#D1FAE5] text-[#059669]'
                          : 'bg-elevated text-[#475569]'
                        }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
                      ) : (
                        <Icon className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[9px] sm:text-[13px] font-bold truncate transition-colors ${isActive ? 'text-[#0F172A]' : 'text-[#334155]'}`}>
                        {stage.label}
                      </div>
                    </div>
                    <div
                      className={`text-[7px] sm:text-[10px] font-mono whitespace-nowrap transition-colors ${isActive ? 'text-[#2563EB]' : isComplete ? 'text-[#059669]' : 'text-[#475569]'
                        }`}
                    >
                      {isComplete ? 'Done' : isActive ? 'Running...' : stage.detail}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Data flow indicator */}
            <div className="mt-1 sm:mt-3 flex items-center justify-between rounded-md bg-white border border-slate-300 shadow-[0_4px_12px_rgba(36,92,146,0.15)] px-2 sm:px-4 py-1.5 sm:py-2">
              <span className="text-[8px] sm:text-[11px] text-[#0F172A] font-bold uppercase tracking-wider">Pipeline ETA</span>
              <span className="text-[10px] sm:text-[13px] font-bold text-[#2563EB]">~12 min</span>
            </div>
          </motion.div>
        )}


        {phase === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-surface/50"
          >
            <video
              ref={(el: HTMLVideoElement | null) => { if (el) el.playbackRate = 1.5; }}
              src={`/video/${currentVideo}.mp4`}
              autoPlay
              muted
              className="h-full w-full object-cover rounded-xl"
              onEnded={() => {
                if (currentVideo === 1) {
                  setCurrentVideo(2);
                } else {
                  setPhase('pipeline');
                  setActiveStage(0);
                  setCurrentVideo(1);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Trusted By ─── */
function TrustedBy() {
  const logos = ['Lufthansa Technik', 'Delta TechOps', 'SIA Engineering', 'Air France KLM E&M', 'ST Aerospace', 'HAECO'];
  return (
    <section className="border-y border-border-subtle bg-surface/30 py-10">
      <div className="mx-auto max-w-[1200px] px-6">
        <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-[#0F172A]">
          Trusted by leading MRO organizations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {logos.map((name) => (
            <span key={name} className="text-[14px] font-bold text-text-tertiary/60 transition-all duration-300 hover:text-accent hover:scale-105 cursor-pointer">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Upload Video', desc: 'Drag & drop borescope footage in any format. Supports 4K, drone, and endoscopic video.' },
    { num: '02', title: 'Frame Extraction', desc: 'AI extracts and deduplicates key frames from hours of raw video footage.' },
    { num: '03', title: 'AI Enhancement', desc: 'Super-resolution and noise reduction brings out hidden defect details.' },
    { num: '04', title: 'Defect Detection', desc: 'Computer vision models identify cracks, erosion, FOD, and thermal damage.' },
    { num: '05', title: '3D Reconstruction', desc: 'Detected defects are mapped onto a 3D digital twin with severity heatmaps.' },
    { num: '06', title: 'Compliance Report', desc: 'FAA/EASA-compliant reports auto-generated with recommendations and part orders.' },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-12 text-center">
          <p className="mb-3" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0F172A' }}>
            How It Works
          </p>
          <h2 className="text-text-primary font-heading tracking-tight" style={{ fontWeight: 700, fontSize: 'clamp(28px, 5vw, 42px)', lineHeight: 1.15, letterSpacing: '-0.025em' }}>
            From Video to Report in Minutes
          </h2>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-[20px] border border-border-default shadow-[0_8px_32px_-8px_rgba(36,92,146,0.1)] p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_48px_rgba(36,92,146,0.25)] cursor-pointer"
            >
              {/* Premium Glossy Shine Effect */}
              <div className="card-shine-guard pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.4)_25%,rgba(255,255,255,0.8)_50%,rgba(255,255,255,0.4)_75%,transparent)] group-hover:transition-transform group-hover:duration-[600ms] group-hover:ease-in-out group-hover:translate-x-full" />

              <div className="relative z-10">
                <span className="mb-2 sm:mb-3 block font-mono text-[12px] text-accent">{step.num}</span>
                <h3 className="mb-2 text-[15px] sm:text-[16px] font-bold text-text-primary leading-tight group-hover:text-accent transition-colors duration-300">{step.title}</h3>
                <p className="text-[13px] sm:text-[14px] leading-[1.6] text-text-secondary">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const features = [
    {
      icon: Cpu,
      title: 'Edge AI Detection',
      desc: 'Real-time defect detection with 97%+ accuracy on cracks, erosion, FOD, and thermal damage.',
    },
    {
      icon: Box,
      title: '3D Digital Twin',
      desc: 'Interactive engine visualization with severity heatmaps and component-level drill-down.',
    },
    {
      icon: FileText,
      title: 'Compliance Reports',
      desc: 'Auto-generated reports mapped to FAA AC 33.27, EASA Part-145, and airline-specific standards.',
    },
    {
      icon: Package,
      title: 'Smart Procurement',
      desc: 'Automated parts ordering when critical defects are detected. Supplier matching and ETA tracking.',
    },
    {
      icon: BarChart3,
      title: 'Predictive Analytics',
      desc: 'Defect trend analysis, fleet health monitoring, and maintenance forecasting across your fleet.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      desc: 'SOC 2 Type II, ISO 27001, role-based access control, full audit trail, and data encryption at rest.',
    },
  ];

  return (
    <section className="border-t border-border-subtle bg-surface/20 py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-12 text-center">
          <p className="mb-3" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0F172A' }}>
            Core Capabilities
          </p>
          <h2 className="text-text-primary font-heading tracking-tight" style={{ fontWeight: 700, fontSize: 'clamp(28px, 5vw, 42px)', lineHeight: 1.15, letterSpacing: '-0.025em' }}>
            Built for Mission-Critical Inspection
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-[20px] border border-border-default shadow-[0_8px_32px_-8px_rgba(36,92,146,0.1)] p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_48px_rgba(36,92,146,0.25)] cursor-pointer"
              >
                {/* Premium Glossy Shine Effect */}
                <div className="card-shine-guard pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.4)_25%,rgba(255,255,255,0.8)_50%,rgba(255,255,255,0.4)_75%,transparent)] group-hover:transition-transform group-hover:duration-[600ms] group-hover:ease-in-out group-hover:translate-x-full" />

                <div className="relative z-10">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-accent-subtle text-accent transition-colors duration-[300ms] group-hover:bg-accent group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-[16px] font-bold text-text-primary group-hover:text-accent transition-colors duration-300">{feature.title}</h3>
                  <p className="text-[13px] leading-[1.6] text-text-secondary">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Security ─── */
function Security() {
  const certs = [
    { label: 'FAA Approved', detail: 'Part 145 Compliant' },
    { label: 'EASA', detail: 'Part-145 / Part-M' },
    { label: 'ISO 27001', detail: 'Information Security' },
    { label: 'SOC 2 Type II', detail: 'Trust Services' },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-10 text-center">
          <p className="mb-3" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0F172A' }}>
            Security & Compliance
          </p>
          <h2 className="mb-3 text-text-primary font-heading tracking-tight" style={{ fontWeight: 700, fontSize: 'clamp(26px, 4vw, 32px)', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Enterprise-Grade Trust
          </h2>
          <p className="mx-auto max-w-[500px] text-[14px] leading-[1.7] text-text-secondary">
            AeroGuard meets the highest aviation and information security standards.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-4">
          {certs.map((cert) => (
            <div key={cert.label} className="group flex w-full sm:w-auto items-center gap-3 rounded-lg border border-border-subtle bg-white px-5 py-3 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_24px_-4px_rgba(36,92,146,0.15)] cursor-pointer">
              <Shield className="h-5 w-5 text-accent shrink-0" />
              <div>
                <div className="text-[13px] font-bold text-text-primary">{cert.label}</div>
                <div className="text-[11px] text-text-tertiary">{cert.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function FinalCTA() {
  const setPendingRoute = useUIStore((state: any) => state.setPendingRoute);
  const [navigating, setNavigating] = useState<'trial' | 'enterprise' | null>(null);

  return (
    <section className="border-t border-border-subtle py-16 sm:py-24">
      <div className="mx-auto max-w-[600px] px-4 sm:px-6 text-center">
        {/* Fluid heading */}
        <h2 className="mb-4 text-text-primary font-heading tracking-tight" style={{ fontWeight: 700, fontSize: 'clamp(28px, 5vw, 42px)', lineHeight: 1.15, letterSpacing: '-0.025em' }}>
          Ready to Transform Your Inspection Workflow?
        </h2>
        <p className="mb-8 text-[15px] leading-[1.7] text-text-secondary">
          Join leading MRO organizations using AeroGuard to reduce inspection time by 80% and improve defect detection accuracy.
        </p>
        {/* CTA buttons — stack on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mt-6">
          <Link
            href="/signup"
            onClick={() => {
              setPendingRoute('/signup');
              setNavigating('trial');
            }}
            className="flex items-center justify-center gap-2 rounded-[12px] bg-accent px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-accent-hover shadow-md shadow-accent/20 w-full sm:w-auto min-w-[180px]"
          >
            {navigating === 'trial' ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Link>
          <Link
            href="/login"
            onClick={() => {
              setPendingRoute('/login');
              setNavigating('enterprise');
            }}
            className="flex items-center justify-center gap-2 rounded-[12px] border border-accent bg-white px-6 py-3 text-[15px] font-medium text-accent transition-colors hover:bg-[#DAEFFF] w-full sm:w-auto min-w-[240px]"
          >
            {navigating === 'enterprise' ? (
              <>
                <span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Request Enterprise Demo
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const columns = [
    { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Changelog'] },
    { title: 'Resources', links: ['Documentation', 'API Reference', 'Status', 'Blog'] },
    { title: 'Company', links: ['About', 'Careers', 'Contact', 'Legal'] },
  ];

  return (
    <footer className="border-t border-border-subtle bg-surface/30 py-12">
      {/* Grid layout: 2 cols on mobile (brand spans 2), flex-wrap on sm+ */}
      <div className="mx-auto max-w-[1200px] grid grid-cols-2 gap-8 px-4 sm:px-6 sm:flex sm:flex-wrap sm:items-start sm:justify-between">
        {/* Brand column — spans 2 cols on mobile grid */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-accent text-[12px] font-bold text-white">A</div>
            <span className="text-[16px] font-bold text-[#0F172A]">AeroGuard</span>
          </div>

          <p className="max-w-[220px] text-[14px] leading-[1.6] text-[#0F172A]">
            AI-powered aircraft inspection platform for MRO organizations worldwide.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-[13px] font-bold uppercase tracking-[0.04em] text-[#0F172A]">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-[15px] text-[#0F172A] hover:text-accent transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-[1200px] border-t border-border-subtle px-4 sm:px-6 pt-6">
        <p className="text-[13px] text-[#0F172A]">
          © 2026 AeroGuard Aviation Technologies. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ─── Landing Page ─── */
export default function LandingPage() {
  return (
    <div className="theme-landing min-h-screen bg-base relative z-0">
      <Nav />
      <Hero />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none landing-middle-mesh-bg -z-10" />
        <TrustedBy />
        <HowItWorks />
        <Features />
        <Security />
      </div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none landing-footer-mesh-bg -z-10" />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
