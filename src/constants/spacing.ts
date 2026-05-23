export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  section: 56,
} as const;

// Bauhaus: minimal border radius, sharp geometric forms
export const BorderRadius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  full: 9999,
} as const;

// Bauhaus: bold borders for geometric emphasis
export const BorderWidth = {
  thin: 1,
  normal: 2,
  thick: 3,
  heavy: 5,
} as const;
