import clsx from 'clsx';
import { buildFileUrl } from '@core';
import { Icon } from '@components/Icon';
import styles from './ProductImage.module.scss';
import type { ProductImageProps } from './ProductImage.types';

export function ProductImage({ bucketKey, alt, size = 'md', contentType, className }: ProductImageProps) {
  return (
    <div className={clsx(styles.frame, styles[size], className)}>
      {bucketKey ? (
        <img className={styles.img} src={buildFileUrl(bucketKey, contentType)} alt={alt} loading="lazy" />
      ) : (
        <Icon name="package" size={size === 'sm' ? 'md' : 'lg'} className={styles.placeholder} label={alt} />
      )}
    </div>
  );
}
