import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `docs/` holds the built bundle published to GitHub Pages. Linting minified
  // output produced ~160 errors that buried every real one in `src/`.
  // `solver/.build` is a clone of the upstream solver, vendored JS included.
  globalIgnores(['dist', 'docs', 'solver/.build']),
  // The solver pipeline and build scripts run in Node, not the browser, and the
  // `.mjs` ones were not matched by the block below at all — so `process`,
  // `URL` and friends read as undefined while the files themselves went
  // unchecked. Lint them, with the right globals.
  {
    files: ['solver/**/*.{js,mjs}', 'scripts/**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
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
