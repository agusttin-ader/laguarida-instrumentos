module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        neutralbg: '#F7F7F8'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', ' -apple-system', 'Segoe UI', 'Roboto']
      }
    },
  },
  plugins: [],
}
