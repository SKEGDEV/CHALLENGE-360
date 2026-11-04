import { createFileRoute } from '@tanstack/react-router';
import { CheckoutPage } from '@pages';
import { requireAuth } from './-guards';

export const Route = createFileRoute('/_storefront/checkout/')({
  beforeLoad: requireAuth,
  component: CheckoutPage,
});
