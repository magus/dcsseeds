module.exports = {
  extends: [
    // '@magusn/magusn' is short for '@magusn/eslint-config-magusn'
    // see https://eslint.org/docs/developer-guide/shareable-configs#npm-scoped-modules
    '@magusn/magusn/react',
    'next/core-web-vitals',
  ],

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
    // e.g. allow console
    'no-console': ['warn', { 'allow': ['dir', 'info', 'warn', 'error'] }],

    // this is really useless in ecma2020
    // https://github.com/eslint/eslint/issues/15576
    'no-inner-declarations': 'off',

    'jest/valid-title': 'off',

    'prettier/prettier': 'off',
  },
};
