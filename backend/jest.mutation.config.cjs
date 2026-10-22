// One Jest project lets Stryker collect per-test coverage across all suites.
const regular = require('./jest.config.cjs');
module.exports = {
  ...regular.projects[0],
  testTimeout: regular.testTimeout,
  displayName: 'mutation',
  watchman: false,
  setupFilesAfterEnv: ['<rootDir>/test/mutation-database-setup.ts'],
  // Full31k acceptance remains mandatory in regular/coverage CI. Directed real
  // corpus cases exercise the whole src scope during each mutant evaluation.
  testMatch: ['**/test/{unit,integration,e2e}/**/*.spec.ts'],
};
