// Technical lifecycle/HTTP harness. This process does not load a model or perform AI.
const { createServer } = require('node:http');
const { readFileSync, writeFileSync } = require('node:fs');
const { setInterval, setTimeout } = require('node:timers');
const argv = process.argv.slice(2);
const option = name => argv[argv.indexOf(name) + 1];
const mode = argv.find(value => value.startsWith('--technical-mode='))?.split('=')[1];
// Independent safety net for mutation workers that intentionally break teardown.
// Normal lifecycle tests assert exit before this deadline; it never proves AI.
const watchdog = Number(option('--technical-watchdog-ms')) || 10000;
setTimeout(() => process.exit(91), watchdog).unref();
if (argv.includes('--version')) {
  process.stdout.write(mode === 'bad-version' ? 'technical-wrong-version\n' : 'technical-native-runtime-1\n');
} else {
  writeFileSync(option('--technical-pid-file'), String(process.pid));
  if (mode === 'exit-early') process.exitCode = 3;
  else if (mode === 'never-listen') setInterval(() => {}, 1000);
  else {
    if (mode === 'ignore-term') process.on('SIGTERM', () => {});
    const port = Number(option('--port'));
    const key = readFileSync(option('--api-key-file'), 'utf8').trim();
    const server = createServer(async (request, response) => {
      response.setHeader('Content-Type', 'application/json');
      if (request.url === '/health') { response.statusCode = mode === 'health-invalid' ? 500 : mode === 'unhealthy' ? 503 : 200; response.end('{"status":"ok"}'); return; }
      const authenticated = request.headers.authorization === 'Bearer ' + key;
      if (!authenticated) { response.statusCode = 401; response.end('{}'); return; }
      const chunks = []; for await (const chunk of request) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString());
      if (body.pending) { response.write('{'); return; }
      response.end(JSON.stringify({ tokens: [1, 2], ownPid: process.pid, authenticated, envLeaked: Object.hasOwn(process.env, 'BIBLE_TECH_PRIVATE_MARKER'), argv }));
    });
    server.listen(port, '127.0.0.1', () => process.stderr.write(`technical harness listening on http://127.0.0.1:${port}\n`));
  }
}
