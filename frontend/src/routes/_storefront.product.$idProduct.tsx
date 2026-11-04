import { createFileRoute } from '@tanstack/react-router';
import { ProductDetailPage } from '@pages';

export const Route = createFileRoute('/_storefront/product/$idProduct')({
  component: ProductDetailRouteComponent,
});

function ProductDetailRouteComponent() {
  const { idProduct } = Route.useParams();
  return <ProductDetailPage key={idProduct} idProduct={Number(idProduct)} />;
}
