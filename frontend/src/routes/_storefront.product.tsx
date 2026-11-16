import { createFileRoute } from '@tanstack/react-router';
import { ProductDetailPage } from '@pages';
import { useSelection } from '@store';
import { requireSelection } from './-guards';

export const Route = createFileRoute('/_storefront/product')({
  beforeLoad: requireSelection((s) => s.idProduct, '/'),
  component: ProductDetailRouteComponent,
});

function ProductDetailRouteComponent() {
  const { idProduct } = useSelection();
  if (idProduct === null) return null;
  return <ProductDetailPage key={idProduct} idProduct={idProduct} />;
}
