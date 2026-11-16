import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { buildFileUrl } from '@core';
import { Icon } from '@components/Icon';
import styles from './ProductGallery.module.scss';
import type { ProductGalleryProps } from './ProductGallery.types';

const AUTO_INTERVAL_MS = 2000;
const MANUAL_PAUSE_MS = 5000;

export function ProductGallery({ photos, alt, className, onImageClick }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [photos]);

  // Rotación automática: una foto cada 500 ms, en bucle.
  useEffect(() => {
    if (isPaused || photos.length < 2) return;
    const id = setInterval(() => {
      setSelectedIndex((index) => (index + 1) % photos.length);
    }, AUTO_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPaused, photos.length]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  // Si el usuario elige una imagen, la rotación se detiene 5 s y luego continúa.
  const selectManually = useCallback((index: number) => {
    setSelectedIndex(index);
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), MANUAL_PAUSE_MS);
  }, []);

  const hasPhotos = photos.length > 0;

  return (
    <div className={clsx(styles.gallery, className)}>
      <button
        type="button"
        className={styles.main}
        onClick={() => onImageClick?.(selectedIndex)}
        disabled={!hasPhotos}
        aria-label={hasPhotos ? `Ver ${alt} a pantalla completa` : alt}
      >
        {hasPhotos ? (
          photos.map((photo, index) => (
            <img
              key={`${photo}-${index}`}
              className={clsx(styles.mainImg, index === selectedIndex && styles.mainImgActive)}
              src={buildFileUrl(photo)}
              alt={index === selectedIndex ? alt : ''}
              aria-hidden={index !== selectedIndex}
            />
          ))
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
              onClick={() => selectManually(index)}
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
