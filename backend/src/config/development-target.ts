export function assertDevelopmentTarget(environment: NodeJS.ProcessEnv): string {
  try {
    if (environment.NODE_ENV !== 'development' || !environment.DATABASE_URL) throw new Error();
    const target = new URL(environment.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(target.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)
      || !target.username || target.username === 'biblia_test' || target.pathname.length <= 1 || target.pathname === '/biblia_test'
      || target.searchParams.getAll('schema').length !== 1 || target.searchParams.get('schema') !== 'app' || target.hash) throw new Error();
    return environment.DATABASE_URL;
  } catch { throw new Error('Unsafe development database'); }
}
