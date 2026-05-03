/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          yellow: '#FFD700',
          red:    '#CC0000',
          blue:   '#1E3A8A',
          dark:   '#0F0F1A',
        },
      },
      fontFamily: {
        pokemon: ['"Press Start 2P"', 'monospace'],
        body:    ['"Inter"', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal': {
          '0%':   { filter: 'blur(20px)', transform: 'scale(0.95)' },
          '100%': { filter: 'blur(0)',    transform: 'scale(1)' },
        },
        'confetti-fall': {
          '0%':   { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh)  rotate(720deg)', opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(255,215,0,0.4)' },
          '50%':      { boxShadow: '0 0 24px 6px rgba(255,215,0,0.8)' },
        },
        'bounce-in': {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '70%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
      },
      animation: {
        'fade-in':     'fade-in 0.4s ease forwards',
        'reveal':      'reveal 0.8s ease forwards',
        'confetti':    'confetti-fall linear forwards',
        'pulse-glow':  'pulse-glow 2s ease-in-out infinite',
        'bounce-in':   'bounce-in 0.5s ease forwards',
      },
    },
  },
  plugins: [],
};
