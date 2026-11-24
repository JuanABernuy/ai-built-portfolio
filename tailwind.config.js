/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-subtle': '#F1F5F9',
        border: '#E2E8F0',
        'border-subtle': '#F1F5F9',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        brand: {
          navy: '#0B2A4A',
          'navy-light': '#133D69',
          'navy-dark': '#061A2F',
        },
        accent: {
          DEFAULT: '#1D4ED8',
          hover: '#1E40AF',
          soft: '#EFF6FF',
          subtle: '#DBEAFE',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', '"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        xl: '12px',
        lg: '8px',
        md: '6px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
      },
    },
  },
  plugins: [],
}
