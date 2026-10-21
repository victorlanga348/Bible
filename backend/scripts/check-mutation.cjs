function verifyMutationReport(report) {
  if (!report || typeof report.files !== 'object' || !report.files) {
    throw new Error('Incomplete mutation report');
  }
  let detected = 0;
  let valid = 0;
  for (const file of Object.values(report.files)) {
    if (!Array.isArray(file.mutants)) throw new Error('Incomplete mutation report');
    for (const mutant of file.mutants) {
      switch (mutant.status) {
        case 'Killed':
        case 'Timeout':
          detected++;
          valid++;
          break;
        case 'Survived':
        case 'NoCoverage':
          valid++;
          break;
        case 'CompileError':
          break;
        default:
          throw new Error('Incomplete mutation report');
      }
    }
  }
  if (!valid) throw new Error('No valid mutants');
  if (100 * detected <= 85 * valid) throw new Error('Mutation score must be strictly greater than 85%');
  return { detected, valid, score: 100 * detected / valid };
}
module.exports = { verifyMutationReport };

if (require.main === module) {
  const { readFileSync } = require('node:fs');
  const result = verifyMutationReport(JSON.parse(readFileSync('reports/mutation/mutation.json', 'utf8')));
  console.log(JSON.stringify(result));
}
