import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base Dark Palette
        obsidian: '#08090B',
        graphite: '#12151B',
        charcoal: '#1A1E26',
        inset: '#0E1014',
        border: '#1F242D',
        'active-border': '#333B49',

        // Luxury Accents
        gold: {
          DEFAULT: '#C5A059',
          hover: '#E2B96C',
          muted: 'rgba(197, 160, 89, 0.15)',
          border: 'rgba(197, 160, 89, 0.30)',
        },

        // Trust & Status
        emerald: {
          DEFAULT: '#10B981',
          bg: 'rgba(16, 185, 129, 0.10)',
          border: 'rgba(16, 185, 129, 0.30)',
        },

        // Typography Hierarchy
        primary: '#F8F9FA',
        secondary: '#9EA5B5',
        muted: '#545B6B',
      },

      // Connected to next/font variables in layout.tsx
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },

      // Custom Luxury Shadows & Ambient Lighting
      boxShadow: {
        goldGlow: '0 0 25px -5px rgba(197, 160, 89, 0.25)',
        goldGlowSm: '0 0 12px -2px rgba(197, 160, 89, 0.20)',
        card: '0 12px 30px -10px rgba(0, 0, 0, 0.7)',
        dropdown: '0 20px 40px -10px rgba(0, 0, 0, 0.9)',
      },

      // Background Gradients & Patterns
      backgroundImage: {
        checkerboard:
          'linear-gradient(45deg, #010101 25%, #23262F 25%, #23262F 50%, #010101 50%, #010101 75%, #23262F 75%, #23262F 100%)',
        'checkerboard-light':
          'linear-gradient(45deg, #D4DCDF 25%, #23262F 25%, #23262F 50%, #D4DCDF 50%, #D4DCDF 75%, #23262F 75%, #23262F 100%)',
        'gold-gradient':
          'linear-gradient(135deg, #C5A059 0%, #E2B96C 50%, #9A7B3E 100%)',
        'radial-hero':
          'radial-gradient(circle at 50% 0%, rgba(197, 160, 89, 0.08) 0%, rgba(8, 9, 11, 0) 70%)',
        // ✅ Add this for subtle gold gradient overlays
        'gold-overlay':
          'linear-gradient(180deg, rgba(197, 160, 89, 0.05) 0%, transparent 100%)',
      },
      backgroundSize: {
        checkerboard: '40px 40px',
      },

      // Smooth Transitions
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      // ✅ Add animation for luxury feel
      animation: {
        'gold-pulse': 'goldPulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 20px -5px rgba(197, 160, 89, 0.2)' },
          '50%': { boxShadow: '0 0 40px -5px rgba(197, 160, 89, 0.4)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // ✅ Add any Tailwind plugins you might need
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};

export default config;