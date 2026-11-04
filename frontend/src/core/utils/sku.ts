function slugPart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toUpperCase();
}

function randomSuffix(length: number): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

export function generateSku(productPublicCode: string, color: string | null, size: string | null): string {
  const parts = [slugPart(productPublicCode).slice(0, 8), slugPart(color ?? '').slice(0, 3), slugPart(size ?? '').slice(0, 3)].filter(
    (part) => part.length > 0,
  );
  parts.push(randomSuffix(4));
  return parts.join('-');
}
