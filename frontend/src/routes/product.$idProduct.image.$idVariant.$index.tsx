import { createFileRoute } from '@tanstack/react-router';
import { ProductImageFullscreenPage } from '@pages';

export const Route = createFileRoute('/product/$idProduct/image/$idVariant/$index')({
  component: ProductImageFullscreenRouteComponent,
});

function ProductImageFullscreenRouteComponent() {
  const { idProduct, idVariant, index } = Route.useParams();
  return (
    <ProductImageFullscreenPage
      key={`${idProduct}-${idVariant}-${index}`}
      idProduct={Number(idProduct)}
      idVariant={Number(idVariant)}
      index={Number(index)}
    />
  );
}
