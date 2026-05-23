import { Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants';

interface Props {
  amount: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export function AmountDisplay({ amount, size = 'medium', color }: Props) {
  const abs = Math.abs(amount);
  const integer = Math.floor(abs);
  const decimal = (abs - integer).toFixed(2).slice(1); // ".xx"

  const sizeStyles = {
    small: { integer: 14, decimal: 11 },
    medium: { integer: 18, decimal: 13 },
    large: { integer: 36, decimal: 20 },
  };

  const s = sizeStyles[size];

  return (
    <Text style={[styles.container, color ? { color } : null]}>
      <Text style={[styles.symbol, { fontSize: s.decimal + 2 }]}>¥</Text>
      <Text style={[styles.integer, { fontSize: s.integer }]}>{integer.toLocaleString()}</Text>
      <Text style={[styles.decimal, { fontSize: s.decimal }]}>{decimal}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { color: Colors.text, fontWeight: '600' },
  symbol: { fontWeight: '500' },
  integer: { fontWeight: '600' },
  decimal: { fontWeight: '500' },
});
