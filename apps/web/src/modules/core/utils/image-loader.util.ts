import { MEDIA_VARIANT_WIDTHS } from '@portfolio/contracts';

const WIDTHS = [...MEDIA_VARIANT_WIDTHS];

export function nearestVariantWidth(width: number): number {
  return WIDTHS.find((value) => value >= width) ?? WIDTHS[WIDTHS.length - 1] ?? width;
}

export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const variant = nearestVariantWidth(width);
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    return src.replace('/upload/', `/upload/w_${variant},c_limit,f_webp,q_auto/`);
  }
  if (src.startsWith('https://media.test/')) {
    const glue = src.includes('?') ? '&' : '?';
    return `${src}${glue}w=${variant}&f=webp`;
  }
  if (src.startsWith('/api/public/media/')) {
    return `${src}?w=${variant}`;
  }
  return src;
}
