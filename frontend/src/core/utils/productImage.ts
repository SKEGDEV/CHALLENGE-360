export const ALLOWED_PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const DIACRITIC_MARKS_PATTERN = /[̀-ͯ]/g;

function sanitizeFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  const name = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  const ext = lastDot > 0 ? fileName.slice(lastDot) : '';
  const safeName = name
    .normalize('NFD')
    .replace(DIACRITIC_MARKS_PATTERN, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `${safeName || 'imagen'}${ext.toLowerCase()}`;
}

export function buildProductImageKey(sku: string, fileName: string): string {
  return `product/${sku}/${Date.now()}-${sanitizeFileName(fileName)}`;
}

export function validateProductImageFile(file: File): string | null {
  if (!ALLOWED_PRODUCT_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_PRODUCT_IMAGE_TYPES)[number])) {
    return 'Solo se permiten imagenes JPG, PNG o WEBP.';
  }
  if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
    return 'La imagen no puede superar los 5 MB.';
  }
  return null;
}

export async function uploadFileToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error('No se pudo subir la imagen a S3.');
  }
}
