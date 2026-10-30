import { z } from 'zod';
import { parseAiRuntimeSettings, type AiRuntimeSettings } from './ai-target';
import { postgresDatabaseUrl } from './database-target';
export { assertTestTarget } from './database-target';

export interface RuntimeConfig extends AiRuntimeSettings {
  readonly environment: 'development' | 'test';
  readonly port: number;
  readonly databaseUrl: string;
  readonly jwtSecret?: string;
  readonly googleClientId?: string;
}

export function parseRuntimeConfig(input: NodeJS.ProcessEnv): RuntimeConfig {
  const environment = z.enum(['development', 'test']).default('development').safeParse(input.NODE_ENV);
  if (!environment.success) throw new Error('Invalid configuration: NODE_ENV');
  const port = z.coerce.number().int().min(1).max(65535).default(3000).safeParse(input.PORT);
  if (!port.success) throw new Error('Invalid configuration: PORT');
  const key = environment.data === 'test' ? 'TEST_DATABASE_URL' : 'DATABASE_URL';
  const url = postgresDatabaseUrl.safeParse(input[key]);
  if (!url.success) throw new Error(`Invalid configuration: ${key}`);
  const jwtSecret = input.jwtSecret;
  if (jwtSecret && new TextEncoder().encode(jwtSecret).byteLength < 32) throw new Error('Invalid configuration: jwtSecret');
  const googleClientId = input.GOOGLE_CLIENT_ID;
  if (googleClientId && (googleClientId.length > 256 || googleClientId !== googleClientId.trim() || !/^[0-9]+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(googleClientId))) throw new Error('Invalid configuration: GOOGLE_CLIENT_ID');
  if (googleClientId && !jwtSecret) throw new Error('Invalid configuration: jwtSecret');
  return { environment: environment.data, port: port.data, databaseUrl: url.data, ...(jwtSecret ? { jwtSecret } : {}), ...(googleClientId ? { googleClientId } : {}), ...parseAiRuntimeSettings({ ...input, NODE_ENV: environment.data }) };
}
