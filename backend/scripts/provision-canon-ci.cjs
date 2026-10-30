const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { fetch, AbortSignal } = globalThis;
const archive = require('../admissions/biblical-canon/porbr2018/ci-archive.json');
const admission = require('../admissions/biblical-canon/porbr2018/manifest.json');
const failed = (code = 'INPUT') => { const error = new Error('CANON_ARCHIVE_PROVISIONING_FAILED'); error.code = /^(INPUT|NO_TOKEN|REDIRECT|SIZE|INTEGRITY|HTTP_[0-9]{3})$/.test(code) ? code : 'INPUT'; throw error; };
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

async function downloadCanonAsset(item, token = process.env.GITHUB_TOKEN, request = fetch) {
  if (!token) failed('NO_TOKEN');
  let response = await request(`https://api.github.com/repos/victorlanga348/Bible/releases/assets/${item.assetId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/octet-stream', 'X-GitHub-Api-Version': '2022-11-28' }, redirect: 'manual', signal: AbortSignal.timeout(120000),
  });
  if (response.status === 302) {
    const location = new URL(response.headers.get('location'));
    if (location.protocol !== 'https:' || !['release-assets.githubusercontent.com', 'objects.githubusercontent.com'].includes(location.hostname)) failed('REDIRECT');
    response = await request(location, { redirect: 'error', signal: AbortSignal.timeout(120000) });
  }
  if (response.status !== 200 || !response.body) failed('HTTP_' + response.status);
  const chunks = []; let count = 0;
  for await (const chunk of response.body) { count += chunk.length; if (count > item.bytes) failed('SIZE'); chunks.push(Buffer.from(chunk)); }
  return Buffer.concat(chunks);
}

async function provisionCanon(directory = 'data/biblical-canon/porbr2018', fetchBytes = downloadCanonAsset) {
  const temporary = [];
  try {
    if (archive.schemaVersion !== 1 || archive.purpose !== 'private-ci-distribution-of-existing-admitted-originals' || archive.repository !== 'victorlanga348/Bible' || archive.draft !== true || archive.files.length !== 2) failed();
    const pins = { 'source.zip': admission.sourceSha256, 'catalog.source.html': admission.catalogSha256 };
    if (archive.files[0].name !== 'source.zip' || archive.files[1].name !== 'catalog.source.html') failed();
    const missing = [];
    for (const item of archive.files) {
      if (pins[item.name] !== item.sha256 || !Number.isSafeInteger(item.assetId) || item.assetId <= 0 || !Number.isSafeInteger(item.bytes) || item.bytes <= 0) failed();
      const target = path.join(directory, item.name), exists = fs.existsSync(target);
      const bytes = exists ? fs.readFileSync(target) : await fetchBytes(item);
      if (bytes.length !== item.bytes || sha(bytes) !== item.sha256) failed('INTEGRITY');
      if (!exists) missing.push({ item, target, bytes });
    }
    fs.mkdirSync(directory, { recursive: true });
    for (const row of missing) { row.temporary = path.join(directory, '.admitted-input-' + crypto.randomUUID()); const fd = fs.openSync(row.temporary, 'wx', 0o600); temporary.push(row.temporary); try { fs.writeFileSync(fd, row.bytes); } finally { fs.closeSync(fd); } }
    // Hard-link promotion is exclusive and atomic; it cannot replace an existing input.
    for (const row of missing) fs.linkSync(row.temporary, row.target);
    return { result: 'PASS', files: archive.files.map(({ name, sha256, bytes }) => ({ name, sha256, bytes })), reused: missing.length === 0 };
  } catch (error) { if (error.message === 'CANON_ARCHIVE_PROVISIONING_FAILED') throw error; failed(); }
  finally { for (const name of temporary) fs.unlinkSync(name); }
}
module.exports = { provisionCanon, downloadCanonAsset };
if (require.main === module) provisionCanon().then(result => console.log(JSON.stringify(result))).catch(error => { console.error('CANON_ARCHIVE_PROVISIONING_FAILED', /^(INPUT|NO_TOKEN|REDIRECT|SIZE|INTEGRITY|HTTP_[0-9]{3})$/.test(error.code) ? error.code : 'INPUT'); process.exitCode = 1; });
