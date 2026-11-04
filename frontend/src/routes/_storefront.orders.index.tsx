import { createFileRoute } from '@tanstack/react-router';
import { OrdersPage } from '@pages';
import { requireAuth } from './-guards';

export const Route = createFileRoute('/_storefront/orders/')({
  beforeLoad: requireAuth,
  component: OrdersPage,
});
