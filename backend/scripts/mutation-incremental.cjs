const { spawnSync } = require('node:child_process');

function run(script, arguments_) {
  const result = spawnSync(process.execPath, [script, ...arguments_], { stdio: 'inherit' });
  if (result.error) console.error('Mutation command failed to start.');
  return result.status ?? 1;
}

const status = run('node_modules/@stryker-mutator/core/bin/stryker.js', [
  'run', '--incremental', '--incrementalFile', 'reports/mutation/incremental.json', ...process.argv.slice(2),
]);
process.exitCode = status === 0 ? run('scripts/check-mutation.cjs', []) : status;
