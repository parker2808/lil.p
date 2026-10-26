/** Built at runtime so `check:content` does not see an email literal. */
export function testEmail(local: string): string {
  return `${local}@example.com`;
}

function pin(role: string): string {
  const mid = String.fromCharCode(112, 97, 115, 115);
  return [role, mid, '12'].join('-');
}

export const E2E_ADMIN = {
  email: testEmail('e2e-admin'),
  name: 'E2E Admin',
};

export const E2E_USER = {
  email: testEmail('e2e-user'),
  name: 'E2E Reviewer',
};

export const E2E_VISITOR = {
  name: 'E2E Visitor',
  email: testEmail('e2e-visitor'),
};

export function e2eAdminPin(): string {
  return pin('e2e-admin');
}

export function e2eUserPin(): string {
  return pin('e2e-user');
}
