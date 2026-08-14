import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `docs/` holds the built bundle published to GitHub Pages. Linting minified
  // output produced ~160 errors that buried every real one in `src/`.
  globalIgnores(['dist', 'docs']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { react },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Without this, base ESLint cannot see that a component referenced only
      // inside JSX is used, and reported every `motion` and `Icon` import in
      // the project as dead code — 18 false errors that hid the real ones.
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
    },
  },
])
