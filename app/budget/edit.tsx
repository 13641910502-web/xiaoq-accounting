import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { Colors, Typography, Spacing } from '../../src/constants';

export default function BudgetEditScreen() {
  const router = useRouter();
  const { setBudget, loadBudgets } = useBudgetStore();
  const { mainCategories, loadCategories } = useCategoryStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [alertThreshold, setAlertThreshold] = useState('80');

  useEffect(() => {
    loadCategories();
    loadBudgets();
  }, []);

  const handleSave = () => {
    const budgetAmount = parseFloat(amount);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      Alert.alert('错误', '请输入有效的预算金额');
      return;
    }

    setBudget(
      selectedCategory,
      budgetAmount,
      period,
      parseInt(alertThreshold) / 100
    );

    Alert.alert('成功', '预算已设置', [
      { text: '确定', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>选择分类</Text>
      <View style={styles.categoryGrid}>
        <TouchableOpacity
          style={[styles.catChip, selectedCategory === null && styles.catChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={styles.catIcon}>💰</Text>
          <Text style={[styles.catName, selectedCategory === null && styles.catNameActive]}>总预算</Text>
        </TouchableOpacity>
        {mainCategories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, selectedCategory === cat.name && styles.catChipActive]}
            onPress={() => setSelectedCategory(cat.name)}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catName, selectedCategory === cat.name && styles.catNameActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>预算金额 (¥)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>预算周期</Text>
        <View style={styles.segmentRow}>
          {['monthly', 'weekly', 'yearly'].map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.segment, period === p && styles.segmentActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.segmentText, period === p && styles.segmentTextActive]}>
                {p === 'monthly' ? '每月' : p === 'weekly' ? '每周' : '每年'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>预警阈值 (%)</Text>
        <TextInput
          style={styles.input}
          value={alertThreshold}
          onChangeText={setAlertThreshold}
          placeholder="80"
          keyboardType="number-pad"
          placeholderTextColor={Colors.textTertiary}
        />
        <Text style={styles.fieldHint}>当支出达到预算的此百分比时发出提醒</Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>保存预算</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  sectionTitle: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '600', marginBottom: Spacing.md },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  catChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  catIcon: { fontSize: 16 },
  catName: { ...Typography.caption, color: Colors.textSecondary },
  catNameActive: { color: Colors.primary, fontWeight: '600' },
  field: { marginBottom: Spacing.xl },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '600', marginBottom: Spacing.sm },
  input: {
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldHint: { ...Typography.caption, color: Colors.textTertiary, marginTop: Spacing.xs },
  segmentRow: { flexDirection: 'row', gap: Spacing.sm },
  segment: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  segmentText: { ...Typography.bodySmall, color: Colors.textSecondary },
  segmentTextActive: { color: Colors.primary, fontWeight: '600' },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: Spacing.lg, borderRadius: 12, alignItems: 'center', marginTop: Spacing.md },
  saveBtnText: { ...Typography.body, color: Colors.white, fontWeight: '700' },
});
