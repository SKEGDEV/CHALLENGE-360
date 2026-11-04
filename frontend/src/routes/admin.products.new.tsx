import { createFileRoute } from '@tanstack/react-router';
import { AdminProductFormPage } from '@pages';

export const Route = createFileRoute('/admin/products/new')({
  component: AdminProductNewRouteComponent,
});

function AdminProductNewRouteComponent() {
  return <AdminProductFormPage idProduct={null} />;
}
