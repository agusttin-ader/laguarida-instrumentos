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
        },
        surface: {
          page: 'var(--dark-bg-page)',
          DEFAULT: 'var(--dark-bg-surface)',
          card: 'var(--dark-bg-card)',
          elevated: 'var(--dark-bg-elevated)',
          sunken: 'var(--dark-surface-2)',
        },
        content: {
          primary: 'var(--dark-text-primary)',
          secondary: 'var(--dark-text-secondary)',
          muted: 'var(--dark-muted)',
        },
        accent: {
          gold: 'var(--accent-gold-light)',
          flame: 'var(--palette-flame)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto'],
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace']
      },
      fontSize: {
        'token-xs': 'var(--text-xs)',
        'token-sm': 'var(--text-sm)',
        'token-base': 'var(--text-base)',
        'token-lg': 'var(--text-lg)',
        'token-xl': 'var(--text-xl)',
        'token-2xl': 'var(--text-2xl)',
        'token-3xl': 'var(--text-3xl)',
      },
      spacing: {
        '18': '4.5rem',
        'nav': '5rem',
        'safe': 'env(safe-area-inset-bottom, 0px)',
        'mobile-gutter': 'var(--mobile-gutter)',
        'section-mobile': 'var(--section-space-mobile)',
        'section-tablet': 'var(--section-space-tablet)',
        'section-desktop': 'var(--section-space-desktop)',
        'mobile-xs': 'var(--mobile-space-xs)',
        'mobile-sm': 'var(--mobile-space-sm)',
        'mobile-md': 'var(--mobile-space-md)',
        'mobile-lg': 'var(--mobile-space-lg)',
        'mobile-xl': 'var(--mobile-space-xl)',
        'mobile-section': 'var(--mobile-section-gap)',
      },
      borderRadius: {
        'mobile-card': 'var(--mobile-radius-card)',
        'mobile-pill': 'var(--mobile-radius-pill)',
      },
      minHeight: {
        'touch': 'var(--mobile-tap)',
        'btn-mobile': 'var(--btn-h-mobile)',
        'btn-desktop': 'var(--btn-h-desktop)',
      },
      maxWidth: {
        shell: '80rem',
        'shell-xl': '90rem',
        'shell-2xl': '100rem',
      },
      boxShadow: {
        'btn-red': 'var(--btn-red-shadow)',
        'btn-whatsapp': 'var(--btn-whatsapp-shadow)',
        'vivid-gold': 'var(--vivid-glow-gold)',
        'vivid-mixed': 'var(--vivid-glow-mixed)',
      },
      backgroundImage: {
        'vivid-gradient': 'var(--vivid-gradient)',
        'vivid-gradient-soft': 'var(--vivid-gradient-soft)',
      },
    },
  },
  plugins: [],
}
