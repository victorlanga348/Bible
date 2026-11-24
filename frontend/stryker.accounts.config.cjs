const base = require('./stryker.config.json');
module.exports = {
  ...base,
  ignorePatterns: ['reports/**', 'test-results/**', 'dist/**'],
  vitest: { ...base.vitest, configFile: 'vitest.accounts.config.ts' },
  mutate: ['src/shared/auth/password-sign-in.tsx', 'src/shared/ui/shell.tsx'],
  jsonReporter: { fileName: 'reports/accounts/mutation.json' },
  htmlReporter: { fileName: 'reports/accounts/mutation.html' },
  incremental: true, incrementalFile: 'reports/accounts/incremental.json',
  concurrency: 1,
};
