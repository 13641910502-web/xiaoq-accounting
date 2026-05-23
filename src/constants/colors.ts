// Bauhaus Color System
// Primary triad: Red, Blue, Yellow + Black, White, Gray
export const Colors = {
  // Bauhaus core
  red: '#E03C31',
  blue: '#1D5BA8',
  yellow: '#F0B823',
  black: '#1A1A1A',
  white: '#FAFAF8',
  lightGray: '#E8E6E0',
  midGray: '#8C8C8C',
  darkGray: '#3D3D3D',

  // Semantic mapping
  primary: '#1D5BA8',
  primaryLight: '#D0DDF0',
  background: '#FAFAF8',
  surface: '#FFFFFF',
  cardBorder: '#1A1A1A',
  text: '#1A1A1A',
  textSecondary: '#5C5C5C',
  textTertiary: '#8C8C8C',
  border: '#1A1A1A',
  error: '#E03C31',
  success: '#2D8C5A',
  warning: '#F0B823',
  income: '#2D8C5A',
  expense: '#E03C31',
  white: '#FFFFFF',
  black: '#1A1A1A',
  overlay: 'rgba(26,26,26,0.6)',
};

// Bauhaus-inspired category palette
// Geometric primaries + derived tones
export const CategoryColors: Record<string, string> = {
  '饮食': '#E03C31', // Red
  '购物': '#F0B823', // Yellow
  '投资': '#1D5BA8', // Blue
  '人情往来': '#E8802A', // Orange
  '交通': '#3D3D3D', // Dark gray
  '住房': '#2D8C5A', // Green
  '娱乐': '#C93060', // Magenta
  '医疗': '#D94F3A', // Red-orange
  '教育': '#1A6B4A', // Dark green
  '其他': '#8C8C8C', // Mid gray
};

export const BudgetLevelColors = {
  safe: '#1A1A1A',
  warning: '#F0B823',
  danger: '#E03C31',
};

// Bauhaus geometric shapes for category icons
export const CategoryShapes: Record<string, 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon'> = {
  '饮食': 'circle',
  '购物': 'square',
  '投资': 'diamond',
  '人情往来': 'hexagon',
  '交通': 'circle',
  '住房': 'square',
  '娱乐': 'triangle',
  '医疗': 'circle',
  '教育': 'square',
  '其他': 'triangle',
};
