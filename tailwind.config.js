/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — soft pink / baby pink / purple / gold accent
        blush: {
          50: '#fff5f8',
          100: '#ffe9f1',
          200: '#ffd3e2',
          300: '#ffb3ce',
          400: '#ff85af',
          500: '#f95d94',
          600: '#e63c78',
          700: '#c02760',
          800: '#9e2251',
          900: '#842047',
        },
        plum: {
          50: '#f8f5ff',
          100: '#f0e9ff',
          200: '#e2d3ff',
          300: '#cbb0ff',
          400: '#ac81f7',
          500: '#8f57ec',
          600: '#7a3bd6',
          700: '#682cb4',
          800: '#582693',
          900: '#492378',
        },
        gold: {
          light: '#f5e6c8',
          DEFAULT: '#c9a24b',
          dark: '#a9822f',
        },
        ink: '#1f1626',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Poppins"', 'system-ui', 'sans-serif'],
        arabic: ['"Cairo"', '"Poppins"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(143, 87, 236, 0.18)',
        card: '0 6px 24px -10px rgba(31, 22, 38, 0.15)',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(180deg, #fff5f8 0%, #ffe9f1 45%, #f0e9ff 100%)',
        'gold-line':
          'linear-gradient(90deg, transparent, #c9a24b, transparent)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
