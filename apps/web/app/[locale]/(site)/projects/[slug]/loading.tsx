import { PageSkeleton } from '@portfolio/ui/components/PageSkeleton/PageSkeleton';
import { DemoLoading } from '@/modules/design-demo/DemoLoading';

export default function Loading() {
  if (process.env.DESIGN_DEMO === '1') return <DemoLoading variant="detail" />;
  return <PageSkeleton variant="article" />;
}
