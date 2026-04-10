import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Design tokens */
        void: '#020408',
        deep: '#060d18',
        surface: '#0a1628',
        raised: '#0f2040',
        cyan: {
          DEFAULT: '#00d4ff',
          dim: '#00d4ff22',
        },
        purple: {
          DEFAULT: '#7c3aed',
          dim: '#7c3aed22',
        },
        hazard: {
          DEFAULT: '#ff4444',
          dim: '#ff444420',
        },
        safe: {
          DEFAULT: '#00ff88',
          dim: '#00ff8820',
        },
        warn: '#ffaa00',
        'text-primary': '#e8f4ff',
        'text-secondary': '#7a9bbf',
        'text-dim': '#3a5a7a',
        /* Legacy aliases kept for compat */
        dark: {
          900: '#0a0e27',
          800: '#1a1f3a',
          700: '#2a2f4a',
          600: '#3a3f5a',
        },
        primary: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        accent: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px #00d4ff40, 0 0 60px #00d4ff20',
        'glow-hazard': '0 0 20px #ff444440, 0 0 60px #ff444420',
        'glow-card': '0 1px 0 #ffffff08 inset, 0 0 0 1px #ffffff05',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'draw-line': 'drawLine 1.2s ease-out forwards',
        'hazard-pulse': 'hazardPulse 3s ease-in-out infinite',
        'star-pulse': 'starPulse 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-slide-up': 'fadeSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};

export default config;