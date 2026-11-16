import { createFileRoute } from '@tanstack/react-router';
import { AdminProductFormPage } from '@pages';
import { useSelection } from '@store';
import { requireSelection } from './-guards';

export const Route = createFileRoute('/admin/products/edit')({
  beforeLoad: requireSelection((s) => s.idAdminProduct, '/admin/products'),
  component: AdminProductEditRouteComponent,
});

function AdminProductEditRouteComponent() {
  const { idAdminProduct } = useSelection();
  if (idAdminProduct === null) return null;
  return <AdminProductFormPage key={idAdminProduct} idProduct={idAdminProduct} />;
}
