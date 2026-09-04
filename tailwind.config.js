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
          sand: '#D4C4A8',
          gold: '#D99530',
          orange: '#D44038',
          flame: '#D44038',
          ink: '#1A1B22',
          cream: '#FAF6F0',
          brown: '#5C4A3A'
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto'],
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        'nav': '5rem',
        'safe': 'env(safe-area-inset-bottom, 0px)'
      },
      minHeight: {
        'touch': '2.75rem'
      }
    },
  },
  plugins: [],
}
