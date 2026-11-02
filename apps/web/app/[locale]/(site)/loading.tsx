import { DemoLoading } from '@/modules/design-demo/DemoLoading';

export default function Loading() {
  return process.env.DESIGN_DEMO === '1' ? <DemoLoading variant="home" /> : null;
}
