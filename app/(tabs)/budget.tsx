import { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { Colors, Typography, Spacing, BudgetLevelColors } from '../../src/constants';
import { formatAmount } from '../../src/utils/currency';

export default function BudgetScreen() {
  const router = useRouter();
  const { statuses, loadBudgets, getStatuses } = useBudgetStore();
  const { mainCategories, loadCategories } = useCategoryStore();

  useEffect(() => {
    loadCategories();
    loadBudgets();
    getStatuses();
  }, []);

  const getProgressColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return BudgetLevelColors.danger;
    if (percentage >= 0.8) return BudgetLevelColors.danger;
    if (percentage >= 0.6) return BudgetLevelColors.warning;
    return BudgetLevelColors.safe;
  };

  const renderBudget = ({ item }: { item: typeof statuses[0] }) => {
    const cat = mainCategories.find(c => c.name === item.budget.main_category);
    const pct = Math.min(item.percentage, 1);
    const color = getProgressColor(item.percentage, item.isOverBudget);

    return (
      <TouchableOpacity
        style={styles.budgetCard}
        onPress={() => router.push(`/budget/${item.budget.main_category ?? 'total'}`)}
      >
        <View style={styles.budgetHeader}>
          <View style={styles.budgetTitle}>
            <Text style={styles.budgetIcon}>{cat?.icon ?? '📦'}</Text>
            <Text style={styles.budgetName}>{item.budget.main_category ?? '总预算'}</Text>
          </View>
          <Text style={styles.budgetAmount}>
            {formatAmount(item.spent)} / {formatAmount(item.budget.amount)}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.progressText, { color }]}>
          {Math.round(item.percentage * 100)}% 已使用
          {item.isOverBudget && ' · 已超支'}
          {item.isWarning && ' · 即将超支'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={64} color={Colors.textTertiary} />
      <Text style={styles.emptyText}>暂无预算</Text>
      <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/budget/edit')}>
        <Text style={styles.addBtnText}>设置预算</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={statuses}
        keyExtractor={item => item.budget.id}
        renderItem={renderBudget}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={statuses.length === 0 ? styles.emptyList : styles.listContent}
      />
      {statuses.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/budget/edit')}>
          <Ionicons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: Spacing.md },
  emptyList: { flex: 1 },
  budgetCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  budgetTitle: { flexDirection: 'row', alignItems: 'center' },
  budgetIcon: { fontSize: 20, marginRight: Spacing.sm },
  budgetName: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  budgetAmount: { ...Typography.caption, color: Colors.textSecondary },
  progressBg: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { ...Typography.caption, marginTop: Spacing.sm },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl },
  emptyText: { ...Typography.body, color: Colors.textTertiary, marginTop: Spacing.md, marginBottom: Spacing.xl },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  addBtnText: { ...Typography.body, color: Colors.white, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
