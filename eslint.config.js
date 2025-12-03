import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'functions/**',
    // Legacy folders no longer part of OS
    'src/Views/**',
    'src/features/**',
    'src/components/**',
    'src/services/**',
    'src/lib/**',
    'src/debug.test.js',
    'src/App.test.js',
    'scripts/**',
    'tests/**',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    ignores: [
      'tailwind.config.js',
      'vite.config.js',
      'functions/**',
      // Legacy folders no longer part of OS
      'src/Views/**',
      'src/features/**',
      'src/components/**',
      'src/services/**',
      'src/lib/**',
      'src/debug.test.js',
      'src/App.test.js',
      'scripts/**',
      'tests/**',
    ],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        module: 'readonly',
        __dirname: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
])
