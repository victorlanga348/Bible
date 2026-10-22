import { acquireMutationSuiteLock } from './helpers/mutation-suite-lock';

let release: (() => Promise<void>) | undefined;
beforeAll(async () => {
  const file = expect.getState().testPath ?? '';
  // The coordinator's own integration test exercises two sessions directly and
  // never reads or writes application tables. Pure unit suites need no lock.
  if (/[\\/]test[\\/](integration|e2e)[\\/]/.test(file) && !file.endsWith('mutation-suite-lock.spec.ts')) {
    release = await acquireMutationSuiteLock(process.env);
  }
}, 100000);
afterAll(async () => { await release?.(); }, 15000);
