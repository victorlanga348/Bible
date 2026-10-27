import { createHash, randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { readPinnedRuntimeProfile, VerifiedRuntimeArtifacts } from '../../../src/modules/ai-assistant/infrastructure/runtime-artifacts';
import type { InstalledRuntimeProfile } from '../../../src/modules/ai-assistant/infrastructure/profile';

describe('pinned profile and technical artifact files; no executable or model is run', () => {
  const reports = resolve('reports'); const created: string[] = [];
  const temporary = async () => { const root = await mkdtemp(join(reports, 'ai-artifact-test-')); created.push(root); return root; };
  const digest = (text: string) => createHash('sha256').update(text).digest('hex');
  const prepare = async () => {
    const home = await temporary();
    const key = randomBytes(36).toString('base64url');
    await mkdir(join(home, 'runtime')); await mkdir(join(home, 'models'));
    const files = { 'runtime/server.fixture': 'technical non-executable binary fixture', 'runtime/library.fixture': 'technical non-executable library fixture', 'models/embedding.fixture': 'technical embedding file, not weights', 'models/generation.fixture': 'technical generation file, not weights' };
    for (const [name, content] of Object.entries(files)) await writeFile(join(home, name), content);
    await writeFile(join(home, 'runtime.key'), key + '\n');
    const profile = JSON.parse(await readFile('admissions/local-extractive-v1.json', 'utf8')) as InstalledRuntimeProfile;
    const policy: InstalledRuntimeProfile = { ...profile, id: 'technical-artifact-policy', runtime: { ...profile.runtime, engineCommit: 'technical-commit', executable: 'runtime/server.fixture', files: Object.entries(files).filter(([name]) => name.startsWith('runtime/')).map(([path, content]) => ({ path, sha256: digest(content) })) }, embedding: { ...profile.embedding, file: 'models/embedding.fixture', bytes: Buffer.byteLength(files['models/embedding.fixture']), sha256: digest(files['models/embedding.fixture']) }, generation: { ...profile.generation, file: 'models/generation.fixture', bytes: Buffer.byteLength(files['models/generation.fixture']), sha256: digest(files['models/generation.fixture']) } };
    return { home, key, policy, artifacts: new VerifiedRuntimeArtifacts(policy, home) };
  };
  afterAll(async () => {
    for (const root of created) {
      const inside = relative(reports, resolve(root));
      if (inside === '..' || inside.startsWith('..' + sep) || isAbsolute(inside) || !inside.startsWith('ai-artifact-test-')) throw new Error('Unsafe technical cleanup target');
      await rm(root, { recursive: true, force: true });
    }
  });
  it('loads only the exact admitted profile and freezes its nested pins', async () => {
    const profile = await readPinnedRuntimeProfile('admissions/local-extractive-v1.json');
    expect(profile.id).toBe('local-extractive-v1');
    expect(Reflect.set(profile, 'id', 'technical change')).toBe(false);
    expect(Reflect.set(profile.runtime.files[0]!, 'sha256', 'technical change')).toBe(false);
  });
  it('rejects an altered profile before using its contents', async () => {
    const root = await temporary(); const path = join(root, 'profile.json');
    const profile = JSON.parse(await readFile('admissions/local-extractive-v1.json', 'utf8')) as InstalledRuntimeProfile;
    await writeFile(path, JSON.stringify({ ...profile, id: 'technical changed profile' }));
    await expect(readPinnedRuntimeProfile(path)).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it('sanitizes missing profile paths', async () => {
    await expect(readPinnedRuntimeProfile(join(await temporary(), 'missing.json'))).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it.each(['embedding', 'generation'] as const)('verifies %s file pins without executing the technical fixtures', async kind => {
    const { home, key, policy, artifacts } = await prepare(); const files = await artifacts.verify(kind);
    expect(files.executable).toBe(join(home, 'runtime/server.fixture'));
    expect(files.model).toBe(join(home, policy[kind].file));
    expect(files.keyFile).toBe(join(home, 'runtime.key'));
    expect(files.key === key).toBe(true);
    expect(files.engineCommit).toBe('technical-commit');
    expect(files.argsPrefix).toEqual([]);
  });
  it.each(['runtime/server.fixture', 'runtime/library.fixture', 'models/embedding.fixture'])('rejects changed bytes in %s', async name => {
    const { home, artifacts } = await prepare(); const bytes = await readFile(join(home, name)); bytes[0] = bytes[0]! ^ 1; await writeFile(join(home, name), bytes);
    await expect(artifacts.verify('embedding')).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it('rejects a missing model before starting any process', async () => {
    const { home, artifacts } = await prepare(); await rm(join(home, 'models/generation.fixture'));
    await expect(artifacts.verify('generation')).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it('cancels verification without exposing the caller reason', async () => {
    const { artifacts } = await prepare(); const controller = new AbortController(); controller.abort('technical private reason');
    const error = await artifacts.verify('embedding', controller.signal).catch((value: unknown) => value);
    expect(error).toBeInstanceOf(AiUnavailableError);
    expect((error as Error).message).not.toContain('private reason');
  });
  it('requires the executable to have its own pin in the runtime manifest', async () => {
    const { home, policy } = await prepare();
    await expect(new VerifiedRuntimeArtifacts({ ...policy, runtime: { ...policy.runtime, files: [] } }, home).verify('embedding')).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it('rejects a model with a mismatched declared size before hashing', async () => {
    const { home, policy } = await prepare();
    await expect(new VerifiedRuntimeArtifacts({ ...policy, embedding: { ...policy.embedding, bytes: policy.embedding.bytes + 1 } }, home).verify('embedding')).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it('does not accept a directory where a pinned file belongs', async () => {
    const { home, artifacts } = await prepare(); await rm(join(home, 'runtime/library.fixture')); await mkdir(join(home, 'runtime/library.fixture'));
    await expect(artifacts.verify('embedding')).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it.each(['', 'short', 'x'.repeat(129), 'x'.repeat(32) + '\nextra-line'])('rejects malformed local credentials without echoing them', async content => {
    const { home, artifacts } = await prepare(); await writeFile(join(home, 'runtime.key'), content);
    await expect(artifacts.verify('embedding')).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it('rejects a missing or excessive credential file', async () => {
    const { home, artifacts } = await prepare(); await rm(join(home, 'runtime.key'));
    await expect(artifacts.verify('embedding')).rejects.toBeInstanceOf(AiUnavailableError);
    await writeFile(join(home, 'runtime.key'), 'x'.repeat(1025));
    await expect(artifacts.verify('embedding')).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it('rejects a path outside its own artifact directory even if its bytes match', async () => {
    const { home, policy } = await prepare(); const outside = await temporary();
    await writeFile(join(outside, 'external.fixture'), 'technical external');
    const altered: InstalledRuntimeProfile = { ...policy, embedding: { ...policy.embedding, file: join(outside, 'external.fixture'), sha256: digest('technical external') } };
    await expect(new VerifiedRuntimeArtifacts(altered, home).verify('embedding')).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it('checks real paths through a directory junction/symlink before reading an external model', async () => {
    const { home, policy } = await prepare(); const outside = await temporary();
    await writeFile(join(outside, 'external.fixture'), 'technical external');
    await symlink(outside, join(home, 'linked-models'), 'junction');
    const altered: InstalledRuntimeProfile = { ...policy, embedding: { ...policy.embedding, file: 'linked-models/external.fixture', sha256: digest('technical external') } };
    await expect(new VerifiedRuntimeArtifacts(altered, home).verify('embedding')).rejects.toBeInstanceOf(AiUnavailableError);
  });
});
