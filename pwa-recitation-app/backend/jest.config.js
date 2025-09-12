module.exports = {
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'node',
  globalSetup: './tests/setup/globalSetup.js',
  globalTeardown: './tests/setup/globalTeardown.js',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/setup/'],
};
