import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useNavigate } from '@tanstack/react-router';
import { buildFileUrl } from '@core';
import { ErrorState, IconButton, Spinner } from '@components';
import { useProductDetailPage } from '@hooks';
import styles from './ProductImageFullscreenPage.module.scss';

interface ProductImageFullscreenPageProps {
  idProduct: number;
  idVariant: number;
  index: number;
}

export function ProductImageFullscreenPage({ idProduct, idVariant, index }: ProductImageFullscreenPageProps) {
  const { product, isLoading, isError, errorMessage, notFound } = useProductDetailPage(idProduct);
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(index);

  const variant = product?.variants.find((v) => v.idVariant === idVariant) ?? null;
  const photos = variant?.photos ?? [];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const onClose = () => void navigate({ to: '/product/$idProduct', params: { idProduct: String(idProduct) } });

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Spinner />
      </div>
    );
  }

  if (isError || notFound || !product || !variant || photos.length === 0) {
    return (
      <div className={styles.page}>
        <ErrorState
          title="No se pudo mostrar la imagen"
          description={errorMessage ?? 'Esta imagen ya no esta disponible.'}
          onRetry={onClose}
        />
      </div>
    );
  }

  const activePhoto = photos[selectedIndex] ?? photos[0];
  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex < photos.length - 1;

  return (
    <div className={styles.page} role="dialog" aria-modal="true" aria-label={product.productName}>
      <div className={styles.header}>
        <span className={styles.title}>{product.productName}</span>
        <IconButton icon="x" label="Cerrar" className={styles.closeBtn} onClick={onClose} />
      </div>

      <div className={styles.stage}>
        {canPrev && (
          <IconButton
            icon="chevron-left"
            label="Imagen anterior"
            className={clsx(styles.navBtn, styles.navPrev)}
            onClick={() => setSelectedIndex((i) => i - 1)}
          />
        )}
        <img className={styles.image} src={buildFileUrl(activePhoto)} alt={product.productName} />
        {canNext && (
          <IconButton
            icon="chevron-right"
            label="Imagen siguiente"
            className={clsx(styles.navBtn, styles.navNext)}
            onClick={() => setSelectedIndex((i) => i + 1)}
          />
        )}
      </div>

      {photos.length > 1 && (
        <div className={styles.thumbs}>
          {photos.map((photo, photoIndex) => (
            <button
              key={`${photo}-${photoIndex}`}
              type="button"
              className={clsx(styles.thumb, photoIndex === selectedIndex && styles.thumbSelected)}
              onClick={() => setSelectedIndex(photoIndex)}
              aria-label={`Ver imagen ${photoIndex + 1} de ${product.productName}`}
              aria-pressed={photoIndex === selectedIndex}
            >
              <img className={styles.thumbImg} src={buildFileUrl(photo)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
