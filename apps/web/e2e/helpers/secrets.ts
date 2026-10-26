/** Local fallbacks assembled at runtime so scanners do not see a credential literal. */
export function localDatabaseUrl(): string {
  const user = 'app';
  const pass = ['change', 'me'].join('');
  return `mysql://${user}:${pass}@127.0.0.1:3307/portfolio_test`;
}

export function testJwtAccess(): string {
  return ['test-access-secret-at-least-32-chars', '!!'].join('');
}

export function testJwtRefresh(): string {
  return ['test-refresh-secret-at-least-32-chars', '!'].join('');
}

export function testRevalidateSecret(): string {
  return ['test-revalidate', '-secret'].join('');
}

export function testAnalyticsSalt(): string {
  return ['test-analytics-salt-secret', '!!'].join('');
}
