import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: [
      'libs/shared/app-injector/**/*.ts',
      'libs/shared/app-injector/**/*.tsx',
      'libs/shared/app-injector/**/*.js',
      'libs/shared/app-injector/**/*.jsx',
    ],
    rules: {},
  },
  {
    files: [
      'libs/shared/app-injector/**/*.ts',
      'libs/shared/app-injector/**/*.tsx',
    ],
    rules: {},
  },
  {
    files: [
      'libs/shared/app-injector/**/*.js',
      'libs/shared/app-injector/**/*.jsx',
    ],
    rules: {},
  },
];
