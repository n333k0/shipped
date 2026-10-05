// srcset for an image in public/, using the copies made by scripts/sizes.mjs.
import { url } from './url';
import sizes from '../data/image-sizes.json';

const table = sizes as Record<string, { w: number; sizes: number[] }>;

export const srcset = (path: string) => {
  const entry = table[path];
  if (!entry || !entry.sizes.length) return undefined;
  const stem = path.slice(0, path.lastIndexOf('.'));
  return [...entry.sizes.map((w) => `${url(`/_w${stem}-${w}.webp`)} ${w}w`), `${url(path)} ${entry.w}w`].join(', ');
};
