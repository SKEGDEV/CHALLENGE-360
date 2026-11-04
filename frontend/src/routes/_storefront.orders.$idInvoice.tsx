import { createFileRoute } from '@tanstack/react-router';
import { OrderDetailPage } from '@pages';
import { requireAuth } from './-guards';

interface OrderDetailSearch {
  success?: boolean;
}

export const Route = createFileRoute('/_storefront/orders/$idInvoice')({
  validateSearch: (search: Record<string, unknown>): OrderDetailSearch => ({
    success: search.success === true || search.success === 'true' ? true : undefined,
  }),
  beforeLoad: requireAuth,
  component: OrderDetailRouteComponent,
});

function OrderDetailRouteComponent() {
  const { idInvoice } = Route.useParams();
  const { success } = Route.useSearch();
  return <OrderDetailPage idInvoice={Number(idInvoice)} showSuccessBanner={success} />;
}
