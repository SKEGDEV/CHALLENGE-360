export interface ProductImageProps {
  bucketKey: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  contentType?: string;
  className?: string;
}
