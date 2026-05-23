import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBillStore } from '../../../src/stores/billStore';
import { useCategoryStore } from '../../../src/stores/categoryStore';
import { Colors, Typography, Spacing } from '../../../src/constants';
import { isValidAmount, isValidDescription } from '../../../src/utils/validation';

export default function EditBillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedBill, fetchBillById, editBill } = useBillStore();
  const { mainCategories, loadCategories } = useCategoryStore();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('其他');
  const [note, setNote] = useState('');

  useEffect(() => {
    loadCategories();
    if (id) fetchBillById(id);
  }, [id]);

  useEffect(() => {
    if (selectedBill) {
      setAmount(String(selectedBill.amount));
      setDescription(selectedBill.description);
      setDate(selectedBill.transaction_date);
      setSelectedCategory(selectedBill.main_category);
      setNote(selectedBill.note ?? '');
    }
  }, [selectedBill]);

  const handleSave = () => {
    if (!isValidAmount(amount)) { Alert.alert('错误', '请输入有效的金额'); return; }
    if (!isValidDescription(description)) { Alert.alert('错误', '请输入账单描述'); return; }
    if (!id) return;

    editBill(id, {
      amount: parseFloat(amount),
      description: description.trim(),
      transaction_date: date,
      main_category: selectedCategory,
      note: note.trim() || undefined,
    });

    router.back();
  };

  if (!selectedBill) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <Text style={styles.label}>金额 (¥)</Text>
        <TextInput style={styles.amountInput} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textTertiary} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>描述</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholderTextColor={Colors.textTertiary} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>日期</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholderTextColor={Colors.textTertiary} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>分类</Text>
        <View style={styles.categoryGrid}>
          {mainCategories.map(cat => (
            <TouchableOpacity key={cat.id} style={[styles.catChip, selectedCategory === cat.name && styles.catChipActive]} onPress={() => setSelectedCategory(cat.name)}>
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catName, selectedCategory === cat.name && styles.catNameActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>备注 (可选)</Text>
        <TextInput style={styles.input} value={note} onChangeText={setNote} placeholderTextColor={Colors.textTertiary} />
      </View>
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>保存修改</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...Typography.body, color: Colors.textTertiary },
  field: { marginBottom: Spacing.xl },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '600', marginBottom: Spacing.sm },
  amountInput: { ...Typography.amountLarge, color: Colors.text, borderBottomWidth: 2, borderBottomColor: Colors.primary, paddingVertical: Spacing.sm },
  input: { ...Typography.body, color: Colors.text, backgroundColor: Colors.surface, borderRadius: 8, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  catChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  catIcon: { fontSize: 16 },
  catName: { ...Typography.caption, color: Colors.textSecondary },
  catNameActive: { color: Colors.primary, fontWeight: '600' },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: Spacing.lg, borderRadius: 12, alignItems: 'center', marginTop: Spacing.md },
  saveBtnText: { ...Typography.body, color: Colors.white, fontWeight: '700' },
});
