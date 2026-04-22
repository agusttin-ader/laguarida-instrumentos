module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        neutralbg: '#F7F7F8',
        brand: {
          cream: '#FFF0DA',
          red: '#ED0003',
          ink: '#120703',
          brown: '#6C3B2A',
          gold: '#FFC308'
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto'],
        display: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        'nav': '5rem',   /* 80px bottom nav + safe area */
        'safe': 'env(safe-area-inset-bottom, 0px)'
      },
      minHeight: {
        'touch': '2.75rem' /* 44px min tap target */
      }
    },
  },
  plugins: [],
}
