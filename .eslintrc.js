module.exports = {
  extends: ['next/core-web-vitals', 'eslint:recommended', 'plugin:import/recommended'],

  env: {
    es6: true,
  },

  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },

  settings: {
    'import/resolver': {
      'node': {
        'paths': ['.'],
        'extensions': ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },

  ignorePatterns: ['crawl/*', 'crawl-dir/*'],

  globals: {
    '__DEV__': 'readonly',
  },

  rules: {
    '@next/next/no-img-element': 'off',

    // e.g. allow console
    'no-console': ['warn', { 'allow': ['dir', 'info', 'warn', 'error'] }],

    'no-unused-vars': [
      'error',
      {
        'vars': 'all',
        'args': 'after-used',
        'caughtErrors': 'all',
        'ignoreRestSiblings': true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    'import/no-unresolved': 'error',

    'jest/valid-title': 'off',

    // this is really useless in ecma2020
    // https://github.com/eslint/eslint/issues/15576
    'no-inner-declarations': 'off',
  },
};
