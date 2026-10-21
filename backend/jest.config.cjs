const transform = { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }] };
module.exports = {
  projects: ['unit', 'integration', 'e2e'].map((name) => ({
    displayName: name,
    haste: { enableSymlinks: true },
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/test'],
    testMatch: [`<rootDir>/test/${name}/**/*.spec.ts`],
    transform,
    moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
    setupFiles: ['<rootDir>/test/setup.cjs'],
    testTimeout: 15000,
  })),
  watchman: false,
  collectCoverageFrom: ['src/**/*.ts', '!src/generated/**'],
  coverageDirectory: 'reports/coverage',
  coverageReporters: ['text', 'json-summary', 'lcov'],
  coverageThreshold: { global: { lines: 90, branches: 85 } },
};
