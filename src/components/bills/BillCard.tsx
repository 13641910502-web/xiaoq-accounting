import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants';
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

export function BillCard({ bill, category, onPress, onLongPress, showDate = true }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.6}
      delayLongPress={500}
    >
      {/* Category Icon */}
      <View style={[styles.iconWrap, { backgroundColor: (category?.color ?? '#B2BEC3') + '18' }]}>
        <Text style={styles.icon}>{category?.icon ?? '📦'}</Text>
      </View>

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
            <Ionicons name="document-text" size={12} color={Colors.textTertiary} style={styles.noteIcon} />
          ) : null}
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountCol}>
        <Text style={styles.amount}>{formatAmount(bill.amount)}</Text>
        <View style={styles.sourceRow}>
          <Text style={styles.categoryLabel}>{bill.main_category}</Text>
          {bill.source !== 'manual' && (
            <Text style={styles.sourceBadge}>{sourceEmoji(bill.source)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function sourceEmoji(source: string): string {
  switch (source) {
    case 'wechat': return '💬';
    case 'alipay': return '💙';
    case 'ocr': return '📷';
    case 'csv': return '📄';
    default: return '';
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: { fontSize: 20 },
  info: { flex: 1, marginRight: Spacing.md },
  description: { ...Typography.body, color: Colors.text },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: Spacing.sm },
  date: { ...Typography.caption, color: Colors.textTertiary },
  subBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  subText: { ...Typography.caption, color: Colors.primary, fontSize: 10 },
  noteIcon: { marginLeft: 2 },
  amountCol: { alignItems: 'flex-end' },
  amount: { ...Typography.amount, color: Colors.text },
  sourceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  categoryLabel: { ...Typography.caption, color: Colors.textTertiary, fontSize: 10 },
  sourceBadge: { fontSize: 12 },
});
