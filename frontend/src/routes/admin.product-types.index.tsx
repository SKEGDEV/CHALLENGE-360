import { createFileRoute } from '@tanstack/react-router';
import { AdminProductTypesPage } from '@pages';

export const Route = createFileRoute('/admin/product-types/')({
  component: AdminProductTypesPage,
});
