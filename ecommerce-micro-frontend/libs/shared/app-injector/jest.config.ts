export default {
  displayName: 'shared-app-injector',
  preset: '../../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      { presets: ['@nx/react/babel'], cwd: __dirname },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/shared/app-injector',
};
