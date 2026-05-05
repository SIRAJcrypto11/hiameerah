import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Hiameerah brand colors - soft, feminine palette
        primary: {
          50: '#fdf4f5',
          100: '#fce8eb',
          200: '#f9d5dc',
          300: '#f5b3c0',
          400: '#ee8a9e',
          500: '#e36080',
          600: '#cf3f65',
          700: '#b02f51',
          800: '#932a47',
          900: '#7d2741',
          950: '#461220',
        },
        secondary: {
          50: '#faf8f7',
          100: '#f5f0ed',
          200: '#ebe0d9',
          300: '#dcc9bc',
          400: '#c9ab98',
          500: '#ba9179',
          600: '#ad7d6d',
          700: '#90685c',
          800: '#77574e',
          900: '#624942',
          950: '#332521',
        },
        accent: {
          lavender: {
            50: '#f9f7fd',
            100: '#f3eefb',
            200: '#e9e0f8',
            300: '#d8c7f2',
            400: '#c1a4e9',
            500: '#a67fdd',
            600: '#8d5fcc',
            700: '#784db3',
            800: '#654194',
            900: '#543779',
            950: '#361f53',
          },
          mint: {
            50: '#f2fdf8',
            100: '#dffbee',
            200: '#c2f5de',
            300: '#94ebc6',
            400: '#5fd9a8',
            500: '#3bc08c',
            600: '#2a9d72',
            700: '#247d5d',
            800: '#21634c',
            900: '#1d5240',
            950: '#0c2e25',
          },
        },
        cream: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f1ea',
          300: '#ede6d9',
          400: '#e2d4bf',
          500: '#d4bea0',
          600: '#c5a684',
          700: '#b08d6c',
          800: '#91735b',
          900: '#775f4c',
          950: '#3f3027',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
