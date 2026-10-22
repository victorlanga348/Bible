export function assertDevelopmentTarget(environment: NodeJS.ProcessEnv): string {
  try {
    if (environment.NODE_ENV !== 'development' || !environment.DATABASE_URL) throw new Error();
    const target = new URL(environment.DATABASE_URL);
    const role = decodeURIComponent(target.username); const database = decodeURIComponent(target.pathname.slice(1));
    if (!['postgres:', 'postgresql:'].includes(target.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)
      || !role || role === 'biblia_test' || !database || database === 'biblia_test'
      || target.searchParams.size !== 1 || target.searchParams.get('schema') !== 'app' || target.hash) throw new Error();
    return environment.DATABASE_URL;
  } catch { throw new Error('Unsafe development database'); }
}
