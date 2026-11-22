import raw from '../../niche/brand.json';

// The niche's brand, written by the /setup skill into niche/brand.json.
// The end card, the accent colours and a few kit defaults read it, so the kit
// itself never names a brand.

export type Brand = {
  configured: boolean;
  /** The name on the end card. */
  name: string;
  /** The small line under the name. */
  tagline: string;
  /** The pill on the end card ("Free on the App Store", "Link in bio"). Empty hides it. */
  cta: string;
  /** The last spoken line of every episode (script key `cta`). */
  ctaSpoken: string;
  /** A logo in public/, for example "brand/logo.svg". Empty shows the name only. */
  logo: string;
  accent: string;
  accentHot: string;
  secondary: string;
  /** Default end-card credit line (data and map credits). */
  credit: string;
  /** Names of real buildings that are stone, for kit/geoworld.tsx. */
  stoneLandmarks: string[];
};

export const brand = raw as Brand;
