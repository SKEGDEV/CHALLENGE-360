import { createFileRoute } from '@tanstack/react-router';
import { OperatorShipmentsPage } from '@pages';

export const Route = createFileRoute('/operator/shipments/')({
  component: OperatorShipmentsPage,
});
