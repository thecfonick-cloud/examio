/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F46E5',   // Indigo
          secondary: '#06B6D4', // Cyan
          dark: '#0F172A',      // Slate 900
          slate: '#475569',     // Slate 600
          border: '#E2E8F0',    // Slate 200
          bg: '#F9FAFB',        // Gray 50
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 20px 25px -5px rgba(79, 70, 229, 0.06), 0 10px 10px -5px rgba(6, 182, 212, 0.03)',
        'premium-hover': '0 25px 30px -5px rgba(79, 70, 229, 0.12), 0 15px 15px -5px rgba(6, 182, 212, 0.06)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(6, 182, 212, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.8))' },
        }
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite linear',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
