import { z } from 'zod';

export interface RuntimeConfig {
  readonly environment: 'development' | 'test';
  readonly port: number;
  readonly databaseUrl: string;
  readonly jwtSecret?: string;
}

const databaseUrl = z.url({ protocol: /^postgres(ql)?$/ }).refine((value) => (URL.parse(value)?.pathname.length ?? 0) > 1);

export function parseRuntimeConfig(input: NodeJS.ProcessEnv): RuntimeConfig {
  const environment = z.enum(['development', 'test']).default('development').safeParse(input.NODE_ENV);
  if (!environment.success) throw new Error('Invalid configuration: NODE_ENV');
  const port = z.coerce.number().int().min(1).max(65535).default(3000).safeParse(input.PORT);
  if (!port.success) throw new Error('Invalid configuration: PORT');
  const key = environment.data === 'test' ? 'TEST_DATABASE_URL' : 'DATABASE_URL';
  const url = databaseUrl.safeParse(input[key]);
  if (!url.success) throw new Error(`Invalid configuration: ${key}`);
  const jwtSecret = input.jwtSecret;
  if (jwtSecret && new TextEncoder().encode(jwtSecret).byteLength < 32) throw new Error('Invalid configuration: jwtSecret');
  return { environment: environment.data, port: port.data, databaseUrl: url.data, ...(jwtSecret ? { jwtSecret } : {}) };
}

export function assertTestTarget(input: NodeJS.ProcessEnv): string {
  const parsed = databaseUrl.safeParse(input.TEST_DATABASE_URL);
  if (input.NODE_ENV !== 'test' || !parsed.success) throw new Error('Unsafe test database');
  const url = new URL(parsed.data);
  const local = new Set(['localhost', '127.0.0.1', '[::1]', 'postgres']);
  if (!local.has(url.hostname) || url.username !== 'biblia_test' || url.pathname !== '/biblia_test' || url.searchParams.size !== 1 || url.searchParams.get('schema') !== 'app' || url.hash) {
    throw new Error('Unsafe test database');
  }
  if (input.DATABASE_URL) {
    try {
      const development = new URL(input.DATABASE_URL);
      if (development.hash || development.searchParams.size > 1 || [...development.searchParams.keys()].some(key => key !== 'schema')) throw new Error();
      const host = (value: URL): string => ['localhost', '127.0.0.1', '[::1]'].includes(value.hostname.toLowerCase()) ? 'loopback' : value.hostname.toLowerCase();
      if (host(url) === host(development) && (url.port || '5432') === (development.port || '5432') && decodeURIComponent(url.pathname) === decodeURIComponent(development.pathname)) throw new Error();
    } catch { throw new Error('Unsafe test database'); }
  }
  return parsed.data;
}
