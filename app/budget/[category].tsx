import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { Colors, Typography, Spacing, BudgetLevelColors } from '../../src/constants';
import { formatAmount } from '../../src/utils/currency';

export default function BudgetDetailScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { statuses, loadBudgets, getStatuses } = useBudgetStore();
  const { mainCategories, loadCategories } = useCategoryStore();

  useEffect(() => {
    loadCategories();
    loadBudgets();
    getStatuses();
  }, []);

  const status = statuses.find(s => (s.budget.main_category ?? 'total') === category);
  const cat = mainCategories.find(c => c.name === status?.budget.main_category);

  if (!status) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>暂无预算数据</Text>
      </View>
    );
  }

  const pct = Math.min(status.percentage, 1);
  const remaining = Math.max(0, status.budget.amount - status.spent);
  const isOver = status.percentage >= 1;
  const isWarning = status.percentage >= status.budget.alert_threshold && !isOver;

  let color = BudgetLevelColors.safe;
  if (isOver) color = BudgetLevelColors.danger;
  else if (isWarning) color = BudgetLevelColors.warning;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.headerIcon}>{cat?.icon ?? '📦'}</Text>
        <Text style={styles.headerTitle}>{status.budget.main_category ?? '总预算'}</Text>
        <Text style={styles.headerSpent}>{formatAmount(status.spent)}</Text>
        <Text style={styles.headerBudget}>预算 {formatAmount(status.budget.amount)}</Text>
      </View>

      {/* Progress */}
      <View style={styles.card}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>已使用</Text>
          <Text style={[styles.progressPct, { color }]}>{Math.round(status.percentage * 100)}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
        </View>
        <View style={styles.remainingRow}>
          <Text style={styles.remainingLabel}>剩余</Text>
          <Text style={[styles.remainingAmount, { color }]}>{formatAmount(remaining)}</Text>
        </View>
      </View>

      {/* Status */}
      <View style={[styles.statusCard, { backgroundColor: color + '15' }]}>
        <Text style={[styles.statusText, { color }]}>
          {isOver ? '⚠️ 已超出预算' : isWarning ? '⚡ 接近预算上限' : '✅ 预算充足'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...Typography.body, color: Colors.textTertiary },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerIcon: { fontSize: 40, marginBottom: Spacing.sm },
  headerTitle: { ...Typography.h2, color: Colors.text },
  headerSpent: { ...Typography.amountLarge, color: Colors.text, marginTop: Spacing.sm },
  headerBudget: { ...Typography.caption, color: Colors.textTertiary, marginTop: Spacing.xs },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, marginBottom: Spacing.md },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  progressLabel: { ...Typography.bodySmall, color: Colors.textSecondary },
  progressPct: { ...Typography.h3, fontWeight: '700' },
  progressBarBg: { height: 12, backgroundColor: Colors.background, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  remainingRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  remainingLabel: { ...Typography.bodySmall, color: Colors.textSecondary },
  remainingAmount: { ...Typography.body, fontWeight: '600' },
  statusCard: { borderRadius: 12, padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.sm },
  statusText: { ...Typography.body, fontWeight: '600' },
});
