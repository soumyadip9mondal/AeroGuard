import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '390px', // iPhone 14 / 15 width — slot between default mobile and sm:640px
      },
      colors: {
        base: '#090909',
        surface: '#111111',
        elevated: '#171717',
        overlay: '#1C1C1C',
        'border-subtle': '#1F1F1F',
        'border-default': '#2A2A2A',
        'border-strong': '#383838',
        'text-primary': '#FAFAFA',
        'text-secondary': '#A1A1AA',
        'text-tertiary': '#71717A',
        'text-inverse': '#0A0A0A',
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          subtle: 'rgba(37, 99, 235, 0.12)',
        },
        success: {
          DEFAULT: '#16A34A',
          subtle: 'rgba(22, 163, 74, 0.10)',
        },
        warning: {
          DEFAULT: '#D97706',
          subtle: 'rgba(217, 119, 6, 0.10)',
        },
        danger: {
          DEFAULT: '#DC2626',
          subtle: 'rgba(220, 38, 38, 0.10)',
        },
        info: {
          DEFAULT: '#0EA5E9',
          subtle: 'rgba(14, 165, 233, 0.10)',
        },
        heatmap: {
          minor: '#16A34A',
          moderate: '#D97706',
          major: '#EA580C',
          critical: '#DC2626',
        },
      },
      fontFamily: {
        display: ['var(--font-google-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        heading: ['var(--font-mileast)', 'serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.4)',
        md: '0 4px 12px rgba(0,0,0,0.3)',
        lg: '0 8px 32px rgba(0,0,0,0.4)',
      },
      transitionTimingFunction: {
        fast: 'cubic-bezier(0.16, 1, 0.3, 1)',
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        page: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        standard: '280ms',
        page: '450ms',
      },
      keyframes: {
        'page-enter': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-accent': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'page-enter': 'page-enter 450ms cubic-bezier(0.22, 1, 0.36, 1)',
        'pulse-accent': 'pulse-accent 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        'slide-in-right': 'slide-in-right 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
