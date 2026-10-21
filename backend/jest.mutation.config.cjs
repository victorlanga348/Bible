// One Jest project lets Stryker collect per-test coverage across all suites.
const regular = require('./jest.config.cjs');
module.exports = {
  ...regular.projects[0],
  displayName: 'mutation',
  watchman: false,
  testMatch: ['**/test/**/*.spec.ts'],
};
