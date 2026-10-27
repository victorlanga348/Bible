import type { InstalledRuntimeProfile } from './profile';
import type { ModelKind } from './session';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { AiUnavailableError } from '../application/errors';

export interface VerifiedModelFiles {
  readonly executable: string; readonly model: string; readonly keyFile: string; readonly key: string; readonly engineCommit: string; readonly argsPrefix: readonly string[];
}
export interface RuntimeArtifactPort {
  readonly home: string; readonly profile: InstalledRuntimeProfile;
  verify(kind: ModelKind, signal?: AbortSignal): Promise<VerifiedModelFiles>;
}
function freezeProfile(value: unknown): void {
  if (value !== null && typeof value === 'object') { Object.values(value).forEach(freezeProfile); Object.freeze(value); }
}
export async function readPinnedRuntimeProfile(file: string): Promise<InstalledRuntimeProfile> {
  try {
    const metadata = await stat(file);
    if (!metadata.isFile() || metadata.size !== 9704) throw new Error();
    const bytes = await readFile(file);
    if (createHash('sha256').update(bytes).digest('hex') !== 'cf12565112a0c5b84a7065200ee01362052f1ae3dee6296c16a8dccabbc5dc0f') throw new Error();
    const profile = JSON.parse(bytes.toString('utf8')) as InstalledRuntimeProfile;
    freezeProfile(profile); return profile;
  } catch { throw new AiUnavailableError('AI_PINNED_PROFILE_INVALID'); }
}
function inside(root: string, target: string): void {
  const path = relative(root, target);
  if (path === '..' || path.startsWith('..' + sep) || isAbsolute(path)) throw new Error();
}
async function regularFile(root: string, name: string): Promise<{ path: string; bytes: number }> {
  const requested = resolve(root, name); inside(root, requested);
  const path = await realpath(requested); inside(root, path);
  const metadata = await stat(path);
  if (!metadata.isFile()) throw new Error();
  return { path, bytes: metadata.size };
}
async function checkHash(path: string, expected: string, signal?: AbortSignal): Promise<void> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path, { signal })) hash.update(chunk as Buffer);
  if (hash.digest('hex') !== expected) throw new Error();
}
export class VerifiedRuntimeArtifacts implements RuntimeArtifactPort {
  constructor(readonly profile: InstalledRuntimeProfile, readonly home: string) {}
  async verify(kind: ModelKind, signal?: AbortSignal): Promise<VerifiedModelFiles> {
    try {
      signal?.throwIfAborted();
      const root = await realpath(this.home);
      if (!this.profile.runtime.files.some(file => file.path === this.profile.runtime.executable)) throw new Error();
      for (const file of this.profile.runtime.files) await checkHash((await regularFile(root, file.path)).path, file.sha256, signal);
      const model = await regularFile(root, this.profile[kind].file);
      if (model.bytes !== this.profile[kind].bytes) throw new Error();
      await checkHash(model.path, this.profile[kind].sha256, signal);
      const keyFile = await regularFile(root, 'runtime.key');
      if (keyFile.bytes > 1024) throw new Error();
      const key = (await readFile(keyFile.path, { encoding: 'utf8', signal })).trim();
      if (key.length < 32 || key.length > 128 || /[^A-Za-z0-9_-]/.test(key)) throw new Error();
      return Object.freeze({ executable: (await regularFile(root, this.profile.runtime.executable)).path, model: model.path, keyFile: keyFile.path, key, engineCommit: this.profile.runtime.engineCommit, argsPrefix: Object.freeze([]) });
    } catch { throw new AiUnavailableError('AI_RUNTIME_ARTIFACTS_INVALID'); }
  }
}
