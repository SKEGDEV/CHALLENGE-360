import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { buildFileUrl } from '@core';
import { Icon } from '@components/Icon';
import styles from './ProductGallery.module.scss';
import type { ProductGalleryProps } from './ProductGallery.types';

export function ProductGallery({ photos, alt, className, onImageClick }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [photos]);

  const activePhoto = photos[selectedIndex] ?? null;

  return (
    <div className={clsx(styles.gallery, className)}>
      <button
        type="button"
        className={styles.main}
        onClick={() => onImageClick?.(selectedIndex)}
        disabled={!activePhoto}
        aria-label={activePhoto ? `Ver ${alt} a pantalla completa` : alt}
      >
        {activePhoto ? (
          <img className={styles.mainImg} src={buildFileUrl(activePhoto)} alt={alt} loading="lazy" />
        ) : (
          <Icon name="package" size="lg" className={styles.placeholder} label={alt} />
        )}
      </button>

      {photos.length > 1 && (
        <div className={styles.thumbs}>
          {photos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              className={clsx(styles.thumb, index === selectedIndex && styles.thumbSelected)}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver imagen ${index + 1} de ${alt}`}
              aria-pressed={index === selectedIndex}
            >
              <img className={styles.thumbImg} src={buildFileUrl(photo)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
