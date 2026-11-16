import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { setSelection } from '@store';
import { Link } from '@tanstack/react-router';
import { buildFileUrl, formatMoney, isValidHexColor } from '@core';
import { Icon } from '@components';
import type { Product } from '@services';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const defaultVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);

  // Una variante representante por color (la primera de cada color).
  const colorVariants = useMemo(() => {
    const seen = new Set<string>();
    return product.variants.filter((variant) => {
      if (!isValidHexColor(variant.color) || seen.has(variant.color)) return false;
      seen.add(variant.color);
      return true;
    });
  }, [product.variants]);

  const [activeColor, setActiveColor] = useState<string | null>(
    isValidHexColor(defaultVariant?.color) ? defaultVariant.color : (colorVariants[0]?.color ?? null),
  );

  const activeVariant = colorVariants.find((variant) => variant.color === activeColor) ?? defaultVariant;
  // Precio mínimo entre las variantes del color activo (o de todas si no hay colores).
  const pricedVariants = activeColor ? product.variants.filter((variant) => variant.color === activeColor) : product.variants;
  const price = Math.min(...(pricedVariants.length > 0 ? pricedVariants : product.variants).map((variant) => variant.price));
  const photo = activeVariant?.photos[0] ?? defaultVariant?.photos[0] ?? null;

  const openProduct = () => setSelection({ idProduct: product.idProduct });

  return (
    <div className={styles.card}>
      <Link to="/product" onClick={openProduct} className={styles.media} aria-label={product.productName}>
        {photo ? (
          <img
            key={photo}
            className={styles.img}
            src={buildFileUrl(photo)}
            alt={`${product.productName}${activeColor ? ` en color ${activeColor}` : ''}`}
            loading="lazy"
          />
        ) : (
          <Icon name="package" size="lg" className={styles.placeholder} label={product.productName} />
        )}
      </Link>
      <div className={styles.body}>
        <Link to="/product" onClick={openProduct} className={styles.titleLink}>
          <h3>{product.productName}</h3>
        </Link>
        <span className={styles.category}>{product.productTypeName}</span>
        {colorVariants.length > 1 && (
          <div className={styles.swatches} role="group" aria-label="Colores disponibles">
            {colorVariants.map((variant) => (
              <button
                key={variant.color}
                type="button"
                className={clsx(styles.swatch, variant.color === activeColor && styles.swatchActive)}
                style={{ backgroundColor: variant.color ?? undefined }}
                aria-label={`Color ${variant.color}`}
                aria-pressed={variant.color === activeColor}
                onClick={() => setActiveColor(variant.color)}
              />
            ))}
          </div>
        )}
        <span key={price} className={styles.price}>{formatMoney(price)}</span>
        {totalStock <= 0 && <span className={styles.outOfStock}>Agotado</span>}
      </div>
    </div>
  );
}
