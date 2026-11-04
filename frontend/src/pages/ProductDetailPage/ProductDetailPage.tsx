import { useMemo, useState } from 'react';
import { formatMoney } from '@core';
import { Button, Chip, Container, ErrorState, ProductImage, Spinner, Stepper, useToast } from '@components';
import { useProductDetailPage } from '@hooks';
import { useCart } from '@store';
import styles from './ProductDetailPage.module.scss';

interface ProductDetailPageProps {
  idProduct: number;
}

export function ProductDetailPage({ idProduct }: ProductDetailPageProps) {
  const { product, isLoading, isError, errorMessage, notFound, onRetry } = useProductDetailPage(idProduct);
  const cart = useCart();
  const { showToast } = useToast();

  const [colorOverride, setColorOverride] = useState<string | null>(null);
  const [sizeOverride, setSizeOverride] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const defaultVariant = useMemo(
    () => product?.variants.find((variant) => variant.isDefault) ?? product?.variants[0] ?? null,
    [product],
  );
  const selectedColor = colorOverride ?? defaultVariant?.color ?? null;
  const selectedSize = sizeOverride ?? defaultVariant?.size ?? null;

  const colors = useMemo(
    () => [...new Set((product?.variants ?? []).map((variant) => variant.color).filter((c): c is string => !!c))],
    [product],
  );
  const sizes = useMemo(
    () => [...new Set((product?.variants ?? []).map((variant) => variant.size).filter((s): s is string => !!s))],
    [product],
  );

  const matchedVariant = useMemo(
    () => product?.variants.find((variant) => variant.color === selectedColor && variant.size === selectedSize) ?? null,
    [product, selectedColor, selectedSize],
  );

  if (isLoading) {
    return (
      <Container as="main" className={styles.page}>
        <Spinner />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container as="main" className={styles.page}>
        <ErrorState description={errorMessage ?? 'No se pudo cargar el producto.'} onRetry={onRetry} />
      </Container>
    );
  }

  if (notFound || !product) {
    return (
      <Container as="main" className={styles.page}>
        <ErrorState title="Producto no encontrado" description="Puede que este producto ya no este disponible." />
      </Container>
    );
  }

  const alreadyInCart = matchedVariant
    ? (cart.items.find((item) => item.idProductVariant === matchedVariant.idVariant)?.quantity ?? 0)
    : 0;
  const available = matchedVariant ? matchedVariant.quantity - alreadyInCart : 0;
  const canAdd = matchedVariant !== null && available > 0;

  const statusLabel = !matchedVariant
    ? 'Selecciona color y talla para ver la disponibilidad.'
    : matchedVariant.quantity <= 0
      ? 'Agotado en este color y talla.'
      : available <= 0
        ? 'Ya tienes en tu bolsa todas las unidades disponibles.'
        : matchedVariant.quantity <= 5
          ? `Solo quedan ${matchedVariant.quantity} unidades.`
          : 'Disponible. Llega en 24 a 48 horas.';

  const onAddToBag = () => {
    if (!matchedVariant || !canAdd) return;
    cart.addItem({
      idProductVariant: matchedVariant.idVariant,
      sku: matchedVariant.sku,
      productName: product.productName,
      size: matchedVariant.size,
      color: matchedVariant.color,
      unitPrice: matchedVariant.price,
      quantity,
      availableStock: matchedVariant.quantity,
      photoKey: matchedVariant.photos[0] ?? null,
    });
    showToast(`${product.productName} se agrego a tu bolsa.`);
    setQuantity(1);
  };

  return (
    <Container as="main" className={styles.page}>
      <div className={styles.grid}>
        <ProductImage
          className={styles.media}
          bucketKey={matchedVariant?.photos[0] ?? product.variants[0]?.photos[0] ?? null}
          alt={product.productName}
          size="lg"
        />
        <div className={styles.info}>
          <span className={styles.category}>{product.productTypeName}</span>
          <h1>{product.productName}</h1>
          <p className={styles.price}>{formatMoney(matchedVariant?.price ?? product.variants[0]?.price ?? 0)}</p>
          <p className={styles.description}>{product.productDescription}</p>

          {colors.length > 0 && (
            <div className={styles.group}>
              <p className={styles.label}>
                Color {selectedColor && <span>{selectedColor}</span>}
              </p>
              <div className={styles.optionRow}>
                {colors.map((color) => (
                  <Chip key={color} selected={selectedColor === color} onClick={() => setColorOverride(color)}>
                    {color}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className={styles.group}>
              <p className={styles.label}>Talla</p>
              <div className={styles.optionRow}>
                {sizes.map((size) => {
                  const variantForSize = product.variants.find(
                    (variant) => variant.size === size && variant.color === selectedColor,
                  );
                  const disabled = !variantForSize || variantForSize.quantity <= 0;
                  return (
                    <Chip
                      key={size}
                      selected={selectedSize === size}
                      disabled={disabled}
                      onClick={() => setSizeOverride(size)}
                    >
                      {size}
                    </Chip>
                  );
                })}
              </div>
            </div>
          )}

          <p className={styles.status}>{statusLabel}</p>

          <div className={styles.buyRow}>
            <Stepper value={quantity} onChange={setQuantity} min={1} max={Math.max(1, available)} disabled={!canAdd} />
            <Button size="lg" className={styles.addBtn} disabled={!canAdd} onClick={onAddToBag}>
              Agregar a la bolsa
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
