import { z } from 'zod';

export const postgresDatabaseUrl = z.url({ protocol: /^postgres(ql)?$/ }).refine((value) => (URL.parse(value)?.pathname.length ?? 0) > 1);

export function assertTestTarget(input: NodeJS.ProcessEnv): string {
  const parsed = postgresDatabaseUrl.safeParse(input.TEST_DATABASE_URL);
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
