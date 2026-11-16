import { createFileRoute } from '@tanstack/react-router';
import { OrderDetailPage } from '@pages';
import { useSelection } from '@store';
import { requireAuth, requireSelection } from './-guards';

interface OrderDetailSearch {
  success?: boolean;
}

const requireInvoice = requireSelection((s) => s.idInvoice, '/orders');

export const Route = createFileRoute('/_storefront/orders/detail')({
  validateSearch: (search: Record<string, unknown>): OrderDetailSearch => ({
    success: search.success === true || search.success === 'true' ? true : undefined,
  }),
  beforeLoad: () => {
    requireAuth();
    requireInvoice();
  },
  component: OrderDetailRouteComponent,
});

function OrderDetailRouteComponent() {
  const { idInvoice } = useSelection();
  const { success } = Route.useSearch();
  if (idInvoice === null) return null;
  return <OrderDetailPage key={idInvoice} idInvoice={idInvoice} showSuccessBanner={success} />;
}
