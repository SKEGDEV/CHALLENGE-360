import { createFileRoute } from '@tanstack/react-router';
import { AdminProductFormPage } from '@pages';

export const Route = createFileRoute('/admin/products/$idProduct')({
  component: AdminProductEditRouteComponent,
});

function AdminProductEditRouteComponent() {
  const { idProduct } = Route.useParams();
  return <AdminProductFormPage key={idProduct} idProduct={Number(idProduct)} />;
}
