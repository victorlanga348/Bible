const { verifyMutationReport } = require('./check-mutation.cjs');

function verifyAiMutationReport(report) {
  const global = verifyMutationReport(report);
  if (Object.values(report.files).some(file => file.mutants.some(mutant => mutant.status === 'NoCoverage'))) throw new Error('S05 requires zero NoCoverage');
  const files = Object.fromEntries(Object.entries(report.files).filter(([name]) => name.replace(/^\.\//, '').startsWith('src/modules/ai-assistant/')));
  return { global, ai: verifyMutationReport({ files }) };
}
module.exports = { verifyAiMutationReport };

if (require.main === module) {
  try {
    const report = JSON.parse(require('node:fs').readFileSync(process.argv[2] || 'reports/mutation/mutation.json', 'utf8'));
    console.log(JSON.stringify(verifyAiMutationReport(report)));
  } catch (error) {
    const messages = new Set(['Incomplete mutation report', 'No valid mutants', 'Mutation score must be strictly greater than 85%', 'S05 requires zero NoCoverage']);
    console.error(messages.has(error?.message) ? error.message : 'AI_MUTATION_GATE_FAILED');
    process.exitCode = 1;
  }
}
