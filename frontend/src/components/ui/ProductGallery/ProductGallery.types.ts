export interface ProductGalleryProps {
  photos: string[];
  alt: string;
  className?: string;
  onImageClick?: (index: number) => void;
}
