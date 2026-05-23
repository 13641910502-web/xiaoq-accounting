import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderWidth } from '../../constants';
import { formatAmount } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import type { Bill } from '../../types/bill';
import type { Category } from '../../types/category';

interface Props {
  bill: Bill;
  category?: Category;
  onPress: () => void;
  onLongPress?: () => void;
  showDate?: boolean;
}

function BauhausIcon({ color }: { color: string }) {
  return (
    <View style={[styles.geoIcon, { backgroundColor: color }]}>
      <View style={styles.geoInner} />
    </View>
  );
}

export function BillCard({ bill, category, onPress, onLongPress, showDate = true }: Props) {
  const catColor = category?.color ?? Colors.midGray;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.6}
      delayLongPress={500}
    >
      {/* Bauhaus geometric category marker */}
      <View style={[styles.geoMarker, { backgroundColor: catColor }]} />

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {bill.description}
        </Text>
        <View style={styles.meta}>
          {showDate && (
            <Text style={styles.date}>{formatDate(bill.transaction_date)}</Text>
          )}
          {bill.sub_category ? (
            <View style={styles.subBadge}>
              <Text style={styles.subText}>{bill.sub_category}</Text>
            </View>
          ) : null}
          {bill.note ? (
            <Ionicons name="document-text" size={12} color={Colors.midGray} style={styles.noteIcon} />
          ) : null}
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountCol}>
        <Text style={[styles.amount, { color: bill.amount >= 0 ? Colors.black : Colors.red }]}>
          {formatAmount(bill.amount)}
        </Text>
        <View style={styles.sourceRow}>
          <View style={[styles.catDot, { backgroundColor: catColor }]} />
          <Text style={styles.categoryLabel}>{bill.main_category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: Colors.lightGray,
  },
  // Geometric marker (vertical bar) instead of rounded emoji circle
  geoMarker: {
    width: 4,
    height: 36,
    marginRight: Spacing.md,
  },
  info: { flex: 1, marginRight: Spacing.md },
  description: { ...Typography.bodyBold, color: Colors.black },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: Spacing.sm },
  date: { ...Typography.caption, color: Colors.textTertiary },
  subBadge: {
    backgroundColor: Colors.black,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  subText: { ...Typography.caption, color: Colors.white, fontSize: 10 },
  noteIcon: { marginLeft: 2 },
  amountCol: { alignItems: 'flex-end' },
  amount: { ...Typography.amount, fontSize: 17 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  catDot: { width: 6, height: 6 },
  categoryLabel: { ...Typography.caption, color: Colors.midGray },
  // Unused but kept for reference
  geoIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  geoInner: { width: 10, height: 10 },
});
