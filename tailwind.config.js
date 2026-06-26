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
        brand: {
          sand: '#D9C58B',
          gold: '#F2AE30',
          orange: '#F28729',
          flame: '#F23C13',
          ink: '#181715',
          cream: '#f5ecd8',
          brown: '#6c5344'
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
