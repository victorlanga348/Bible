const base = require('./stryker.config.json');
const regular = require('./jest.config.cjs');
module.exports = {
  ...base,
  ignorePatterns: ['reports/**', 'data/**', 'dist/**'],
  disableTypeChecks: '**/*.ts',
  mutate: ['src/infrastructure/password*.ts', 'src/presentation/password-auth.controller.ts', 'src/app.ts'],
  jest: { config: { ...regular.projects[0], displayName: 'accounts-mutation',
    testMatch: ['<rootDir>/test/unit/password*.spec.ts', '<rootDir>/test/e2e/password-auth.spec.ts', '<rootDir>/test/e2e/google-auth.spec.ts'], testTimeout: 30000 } },
  jsonReporter: { fileName: 'reports/accounts/mutation.json' },
  htmlReporter: { fileName: 'reports/accounts/mutation.html' },
  incremental: true, incrementalFile: 'reports/accounts/incremental.json',
  concurrency: 1,
};
