import { createFileRoute } from '@tanstack/react-router';
import { OperatorInventoryPage } from '@pages';

export const Route = createFileRoute('/operator/inventory/')({
  component: OperatorInventoryPage,
});
