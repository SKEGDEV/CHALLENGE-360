import { createFileRoute } from '@tanstack/react-router';
import { CheckoutPaymentPage } from '@pages';
import { requireAuth } from './-guards';

interface CheckoutPaymentSearch {
  idInvoice: number;
}

export const Route = createFileRoute('/_storefront/checkout/payment')({
  validateSearch: (search: Record<string, unknown>): CheckoutPaymentSearch => ({
    idInvoice: Number(search.idInvoice),
  }),
  beforeLoad: requireAuth,
  component: CheckoutPaymentRouteComponent,
});

function CheckoutPaymentRouteComponent() {
  const { idInvoice } = Route.useSearch();
  return <CheckoutPaymentPage idInvoice={idInvoice} />;
}
