const base = require('./stryker.config.json');
module.exports = {
  ...base,
  ignorePatterns: ['reports/**', 'data/**', 'dist/**'],
  disableTypeChecks: '**/*.ts',
  mutate: ['src/infrastructure/password*.ts', 'src/presentation/password-auth.controller.ts', 'src/app.ts'],
  jest: { projectType: 'custom', configFile: 'jest.accounts.config.cjs', enableFindRelatedTests: false },
  jsonReporter: { fileName: 'reports/accounts/mutation.json' },
  htmlReporter: { fileName: 'reports/accounts/mutation.html' },
  incremental: true, incrementalFile: 'reports/accounts/incremental.json',
  concurrency: 1,
  maxTestRunnerReuse: 25,
};
