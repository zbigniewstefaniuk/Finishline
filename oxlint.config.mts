import { defineConfig } from 'oxlint'

const FRAMEWORK_IMPORTS = ['react', 'react-dom', 'react-dom/*']

export default defineConfig({
  plugins: ['unicorn', 'oxc', 'react', 'typescript', 'import', 'promise'],
  categories: {
    correctness: 'error',
    perf: 'warn',
  },
  env: {
    builtin: true,
    browser: true,
    es2026: true,
  },
  options: {
    typeAware: true,
  },
  ignorePatterns: ['node_modules', 'native', 'dist'],
  rules: {
    'no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-shadow': 'warn',
    'max-params': ['error', 2],
    'max-depth': ['error', 3],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/error-boundaries': 'error',
    'react/globals': 'error',
    'react/immutability': 'error',
    'react/incompatible-library': 'error',
    'react/no-deriving-state-in-effects': 'error',
    'react/preserve-manual-memoization': 'error',
    'react/purity': 'error',
    'react/refs': 'error',
    'react/set-state-in-effect': 'error',
    'react/set-state-in-render': 'error',
    'react/static-components': 'error',
    'react/unsupported-syntax': 'error',
    'react/use-memo': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-useless-fragment': 'warn',
    'react/no-array-index-key': 'warn',
    'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
    'unicorn/filename-case': ['error', { cases: { kebabCase: true } }],
    'unicorn/no-null': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-negated-condition': 'warn',
    'unicorn/numeric-separators-style': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-string-replace-all': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/switch-case-braces': 'error',
    'unicorn/throw-new-error': 'error',
    '@typescript-eslint/array-type': ['error', { default: 'array' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-type-assertion': 'warn',
    '@typescript-eslint/only-throw-error': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
  },
  overrides: [
    {
      files: ['src/domain/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              { group: FRAMEWORK_IMPORTS, message: 'src/domain stays plain TypeScript.' },
            ],
          },
        ],
      },
    },
    {
      files: ['**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-type-assertion': 'off',
      },
    },
  ],
})
