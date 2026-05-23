import { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { BillCard } from './BillCard';
import { Colors, Typography, Spacing } from '../../constants';
import { formatDate } from '../../utils/date';
import { formatAmount } from '../../utils/currency';
import type { Bill } from '../../types/bill';
import type { Category } from '../../types/category';

interface Section {
  title: string;
  dateLabel: string;
  total: number;
  data: Bill[];
}

interface Props {
  bills: Bill[];
  categories: Category[];
  onPressBill: (bill: Bill) => void;
  onLongPressBill?: (bill: Bill) => void;
  onEndReached?: () => void;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
}

export function BillTimeline({
  bills,
  categories,
  onPressBill,
  onLongPressBill,
  onEndReached,
  ListHeaderComponent,
  ListEmptyComponent,
}: Props) {
  const sections = useMemo(() => {
    const map = new Map<string, Bill[]>();
    for (const bill of bills) {
      const key = bill.transaction_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(bill);
    }

    const result: Section[] = [];
    for (const [date, items] of map) {
      const total = items.reduce((sum, b) => sum + b.amount, 0);
      result.push({
        title: date,
        dateLabel: formatDate(date),
        total,
        data: items,
      });
    }
    return result;
  }, [bills]);

  const getCategory = (name: string) => categories.find(c => c.name === name);

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      stickySectionHeadersEnabled
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionDate}>{section.dateLabel}</Text>
          <Text style={styles.sectionTotal}>小计 {formatAmount(section.total)}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <BillCard
          bill={item}
          category={getCategory(item.main_category)}
          onPress={() => onPressBill(item)}
          onLongPress={() => onLongPressBill?.(item)}
        />
      )}
      renderSectionFooter={({ section }) => (
        section !== sections[sections.length - 1] ? <View style={styles.sectionFooter} /> : null
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={bills.length === 0 ? { flex: 1 } : undefined}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  sectionDate: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '600' },
  sectionTotal: { ...Typography.caption, color: Colors.textTertiary },
  sectionFooter: { height: Spacing.lg, backgroundColor: Colors.background },
});
