import { useEffect, useRef, useState } from 'react';
import { buildFileUrl } from '@core/utils/fileUrl';
import styles from './HomePage.module.scss';

const VIDEO_KEYS = ['stock/videos/stockvideo1.mp4', 'stock/videos/stockvideo2.mp4'];
const PARALLAX_FACTOR = 0.4;
const PARALLAX_MAX_RATIO = 0.2;

export function HeroBackgroundVideo() {
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const videoRefs = [videoRefA, videoRefB];
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (hasError) return;
    videoRefs[activeIndex].current?.play().catch(() => {});
  }, [activeIndex, hasError]);

  useEffect(() => {
    if (hasError) return;

    let frameId = 0;
    const applyParallax = () => {
      const el = parallaxRef.current;
      const hero = el?.parentElement;
      if (!el || !hero) return;
      const maxShift = hero.offsetHeight * PARALLAX_MAX_RATIO;
      const offset = Math.min(window.scrollY * PARALLAX_FACTOR, maxShift);
      el.style.transform = `translateY(${offset}px)`;
    };
    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(applyParallax);
    };

    applyParallax();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, [hasError]);

  if (hasError) {
    return <div className={styles.heroBg} />;
  }

  const handleEnded = (index: number) => {
    const endedVideo = videoRefs[index].current;
    if (endedVideo) {
      endedVideo.currentTime = 0;
    }
    setActiveIndex((index + 1) % VIDEO_KEYS.length);
  };

  return (
    <div className={styles.heroBg} ref={parallaxRef}>
      {VIDEO_KEYS.map((key, index) => (
        <video
          key={key}
          ref={videoRefs[index]}
          className={`${styles.heroVideo} ${activeIndex === index ? styles.heroVideoActive : ''}`}
          src={buildFileUrl(key, 'video/mp4')}
          muted
          playsInline
          preload="auto"
          autoPlay={index === 0}
          onEnded={() => handleEnded(index)}
          onError={() => setHasError(true)}
        />
      ))}
      <div className={styles.heroOverlay} />
    </div>
  );
}
