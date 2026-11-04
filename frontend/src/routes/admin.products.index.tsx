import { createFileRoute } from '@tanstack/react-router';
import { AdminProductsPage } from '@pages';

export const Route = createFileRoute('/admin/products/')({
  component: AdminProductsPage,
});
