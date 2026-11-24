const regular = require('./jest.config.cjs');
module.exports = {
  ...regular.projects[0],
  displayName: 'accounts',
  watchman: regular.watchman,
  testTimeout: regular.testTimeout,
  collectCoverageFrom: ['src/infrastructure/password*.ts', 'src/presentation/password-auth.controller.ts'],
  coverageDirectory: 'reports/accounts/coverage',
  coverageReporters: regular.coverageReporters,
  coverageThreshold: regular.coverageThreshold,
  // Root-independent globs also work inside Stryker's Windows sandbox.
  testMatch: ['**/test/unit/password*.spec.ts', '**/test/e2e/password-auth.spec.ts', '**/test/e2e/google-auth.spec.ts'],
};
