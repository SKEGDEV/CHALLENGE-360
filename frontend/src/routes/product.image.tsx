import { createFileRoute } from '@tanstack/react-router';
import { ProductImageFullscreenPage } from '@pages';
import { useSelection } from '@store';
import { requireSelection } from './-guards';

export const Route = createFileRoute('/product/image')({
  beforeLoad: () => {
    requireSelection((s) => s.idProduct, '/')();
    requireSelection((s) => s.image, '/')();
  },
  component: ProductImageFullscreenRouteComponent,
});

function ProductImageFullscreenRouteComponent() {
  const { idProduct, image } = useSelection();
  if (idProduct === null || image === null) return null;
  return (
    <ProductImageFullscreenPage
      key={`${idProduct}-${image.idVariant}-${image.index}`}
      idProduct={idProduct}
      idVariant={image.idVariant}
      index={image.index}
    />
  );
}
