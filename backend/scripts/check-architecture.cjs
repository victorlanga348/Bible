function checkDependencies(files) {
  const ts = require('typescript');
  const path = require('node:path').posix;
  const graph = new Map();
  const errors = [];
  for (const [name, content] of Object.entries(files)) {
    const imports = [];
    const source = ts.createSourceFile(name, content, ts.ScriptTarget.Latest, true);
    function inspect(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        imports.push(node.moduleSpecifier.text);
      }
      if (ts.isCallExpression(node) && node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0]) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
        imports.push(node.arguments[0].text);
      }
      ts.forEachChild(node, inspect);
    }
    inspect(source);
    const edges = [];
    for (const imported of imports) {
      const external = !imported.startsWith('.');
      const resolved = external ? imported : path.normalize(path.join(path.dirname(name), imported));
      const domain = name.includes('/domain/');
      const application = name.includes('/application/');
      const forbidden = (domain && (external || /\/(application|infrastructure|presentation)(\/|$)/.test(resolved))) ||
        (application && (external || /\/(infrastructure|presentation)(\/|$)/.test(resolved))) ||
        (name.split('/')[1] !== resolved.split('/')[1] && name.startsWith('modules/') && /\/(infrastructure|presentation)(\/|$)/.test(resolved));
      if (forbidden) errors.push(`forbidden dependency: ${name} -> ${imported}`);
      const target = [resolved, `${resolved}.ts`, `${resolved}/index.ts`, resolved.replace(/\.js$/, '.ts')].find((p) => Object.hasOwn(files, p));
      if (target) edges.push(target);
    }
    graph.set(name, edges);
  }
  const active = new Set();
  const visited = new Set();
  function visit(name) {
    if (active.has(name)) { errors.push(`dependency cycle: ${name}`); return; }
    if (visited.has(name)) return;
    active.add(name);
    for (const next of graph.get(name)) visit(next);
    active.delete(name);
    visited.add(name);
  }
  for (const name of graph.keys()) visit(name);
  return errors;
}
module.exports = { checkDependencies };
