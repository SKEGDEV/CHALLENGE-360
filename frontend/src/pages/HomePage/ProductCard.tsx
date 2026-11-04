import { Link } from '@tanstack/react-router';
import { formatMoney } from '@core';
import { ProductImage } from '@components';
import type { Product } from '@services';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const defaultVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
  const minPrice = Math.min(...product.variants.map((variant) => variant.price));
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);

  return (
    <Link to="/product/$idProduct" params={{ idProduct: String(product.idProduct) }} className={styles.card}>
      <ProductImage bucketKey={defaultVariant?.photos[0] ?? null} alt={product.productName} size="lg" />
      <div className={styles.body}>
        <h3>{product.productName}</h3>
        <span className={styles.category}>{product.productTypeName}</span>
        <span className={styles.price}>{formatMoney(minPrice)}</span>
        {totalStock <= 0 && <span className={styles.outOfStock}>Agotado</span>}
      </div>
    </Link>
  );
}
