module.exports = {
  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {},
    sourceType: 'module',
  },

  env: {
    es2020: true,
    node: true,
  },

  plugins: ['node', 'prettier'],

  ignorePatterns: ['node_modules/', 'dist/'],

  globals: {
    document: 'readonly',
    navigator: 'readonly',
    window: 'readonly',
  },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],

  // recommened + most best practices
  rules: {
    'array-callback-return': 'error',
    'block-scoped-var': 'warn',
    'default-case': 'error',
    'default-param-last': 'error',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'guard-for-in': 'warn',
    'no-constructor-return': 'error',
    'no-else-return': 'warn',
    'no-floating-decimal': 'warn',
    'no-implied-eval': 'error',
    'no-invalid-this': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'none',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^(_|Logger$)',
      },
    ],
    'no-self-compare': 'error',
    'no-throw-literal': 'warn',
    'prefer-regex-literals': 'warn',
    'require-await': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/camelcase': 'off',
  },
};
