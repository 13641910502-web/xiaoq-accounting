import { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { Colors, Typography, Spacing, BudgetLevelColors, BorderWidth } from '../../src/constants';
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
            <View style={[styles.catMarker, { backgroundColor: cat?.color ?? Colors.black }]} />
            <Text style={styles.budgetName}>{item.budget.main_category ?? '总预算'}</Text>
          </View>
          <Text style={styles.budgetAmount}>
            {formatAmount(item.spent)} <Text style={styles.budgetTotal}>/ {formatAmount(item.budget.amount)}</Text>
          </Text>
        </View>
        <View style={styles.progressTrack}>
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
      <View style={styles.emptyGeo}>
        <View style={[styles.emptyGeoBox, { backgroundColor: Colors.red }]} />
        <View style={[styles.emptyGeoBox, { backgroundColor: Colors.blue }]} />
        <View style={[styles.emptyGeoBox, { backgroundColor: Colors.yellow }]} />
      </View>
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
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: Spacing.lg },
  emptyList: { flex: 1 },
  budgetCard: {
    backgroundColor: Colors.surface,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  budgetTitle: { flexDirection: 'row', alignItems: 'center' },
  catMarker: { width: 4, height: 20, marginRight: Spacing.sm },
  budgetName: { ...Typography.bodyBold, color: Colors.black },
  budgetAmount: { ...Typography.bodyBold, color: Colors.black },
  budgetTotal: { ...Typography.bodySmall, color: Colors.midGray },
  progressTrack: {
    height: 10,
    backgroundColor: Colors.background,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.black,
  },
  progressFill: { height: '100%' },
  progressText: { ...Typography.label, marginTop: Spacing.sm },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl },
  emptyGeo: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  emptyGeoBox: { width: 24, height: 24 },
  emptyText: { ...Typography.bodyBold, color: Colors.textSecondary, marginBottom: Spacing.xl },
  addBtn: {
    backgroundColor: Colors.black,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  addBtnText: { ...Typography.bodyBold, color: Colors.white },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 52,
    height: 52,
    borderRadius: 0,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
  },
});
