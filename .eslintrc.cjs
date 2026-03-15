module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  env: { browser: true, node: true, es2024: true },
  plugins: ['@typescript-eslint','react','react-hooks','jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'no-console': 'off',
    'react/react-in-jsx-scope': 'off',
    // Relax rules that produce many non-actionable errors in this repo
    'react/prop-types': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/set-state-in-effect': 'off',
    'no-empty': 'warn',
    'no-inner-declarations': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-undef': 'off'
  }
}
