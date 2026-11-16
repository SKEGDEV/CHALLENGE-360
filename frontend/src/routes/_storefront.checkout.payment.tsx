import { createFileRoute } from '@tanstack/react-router';
import { CheckoutPaymentPage } from '@pages';
import { useSelection } from '@store';
import { requireAuth, requireSelection } from './-guards';

const requireInvoice = requireSelection((s) => s.idCheckoutInvoice, '/checkout');

export const Route = createFileRoute('/_storefront/checkout/payment')({
  beforeLoad: () => {
    requireAuth();
    requireInvoice();
  },
  component: CheckoutPaymentRouteComponent,
});

function CheckoutPaymentRouteComponent() {
  const { idCheckoutInvoice } = useSelection();
  if (idCheckoutInvoice === null) return null;
  return <CheckoutPaymentPage idInvoice={idCheckoutInvoice} />;
}
