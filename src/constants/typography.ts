import { TextStyle } from 'react-native';

// Bauhaus Typography — geometric, bold, functional
export const Typography: Record<string, TextStyle> = {
  h1: { fontSize: 32, fontWeight: '900', lineHeight: 38, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '800', lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '700', lineHeight: 24 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '600', lineHeight: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
  amount: { fontSize: 20, fontWeight: '800', lineHeight: 26 },
  amountLarge: { fontSize: 40, fontWeight: '900', lineHeight: 48, letterSpacing: -1 },
  label: { fontSize: 11, fontWeight: '700', lineHeight: 14, letterSpacing: 1, textTransform: 'uppercase' },
};
