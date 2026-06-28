import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#ffffff',
          'bg-dark': '#191919',
          sidebar: '#f7f6f3',
          'sidebar-hover': '#e8e7e4',
          'sidebar-dark': '#2f2f2f',
          'sidebar-hover-dark': '#3a3a3a',
          card: '#ffffff',
          'card-dark': '#1e1e1e',
          border: '#e9e9e7',
          'border-dark': '#373737',
          text: '#37352f',
          'text-dark': '#e2e2e0',
          muted: '#9b9a97',
          'muted-dark': '#9b9a97',
          blue: '#2383e2',
          'blue-hover': '#0b6bcb',
          red: '#e03e3e',
          green: '#0f8a5e',
          orange: '#d9730d',
          purple: '#6940a5',
          pink: '#da3690',
          hover: '#efefef',
          'hover-dark': '#2f2f2f',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'page-title': ['40px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'section-title': ['20px', { lineHeight: '1.2', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '1.2', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5' }],
        'body-sm': ['12px', { lineHeight: '1.4' }],
        'caption': ['11px', { lineHeight: '1.2', letterSpacing: '0.03em' }],
      },
      borderRadius: {
        'notion': '10px',
      },
      boxShadow: {
        'notion': '0 1px 3px rgba(0,0,0,0.06)',
        'notion-hover': '0 2px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
export default config
