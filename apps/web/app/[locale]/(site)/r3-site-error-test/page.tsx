import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function SiteErrorFixture() {
  if (process.env.R3_E2E_STATES !== '1') notFound();
  throw new Error('R3 site error fixture');
}
