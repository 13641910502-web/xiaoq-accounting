import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBillStore } from '../../src/stores/billStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { Colors, Typography, Spacing } from '../../src/constants';
import { formatDate } from '../../src/utils/date';
import { formatAmount } from '../../src/utils/currency';

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedBill, fetchBillById, removeBill } = useBillStore();
  const { mainCategories, loadCategories } = useCategoryStore();

  useEffect(() => {
    loadCategories();
    if (id) fetchBillById(id);
  }, [id]);

  const bill = selectedBill;
  if (!bill) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>加载中...</Text>
      </View>
    );
  }

  const cat = mainCategories.find(c => c.name === bill.main_category);

  const handleDelete = () => {
    Alert.alert('删除账单', '确定要删除这笔账单吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          removeBill(bill.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Amount */}
      <View style={styles.amountSection}>
        <Text style={styles.amount}>{formatAmount(bill.amount)}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: (cat?.color ?? '#B2BEC3') + '20' }]}>
          <Text style={styles.categoryText}>{cat?.icon ?? '📦'} {bill.main_category}</Text>
        </View>
        {bill.sub_category && (
          <Text style={styles.subCategory}>{bill.sub_category}</Text>
        )}
      </View>

      {/* Details */}
      <View style={styles.detailCard}>
        <DetailRow icon="receipt-outline" label="描述" value={bill.description} />
        <DetailRow icon="calendar-outline" label="日期" value={formatDate(bill.transaction_date)} />
        {bill.transaction_time && (
          <DetailRow icon="time-outline" label="时间" value={bill.transaction_time} />
        )}
        <DetailRow icon="cloud-outline" label="来源" value={sourceLabel(bill.source)} />
        {bill.note && <DetailRow icon="document-text-outline" label="备注" value={bill.note} />}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/records/edit/${bill.id}`)}
        >
          <Ionicons name="create-outline" size={20} color={Colors.white} />
          <Text style={styles.editBtnText}>编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
          <Text style={styles.deleteBtnText}>删除</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={18} color={Colors.textTertiary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function sourceLabel(source: string): string {
  const map: Record<string, string> = { wechat: '微信', alipay: '支付宝', csv: 'CSV导入', manual: '手动', ocr: '截图识别' };
  return map[source] ?? source;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...Typography.body, color: Colors.textTertiary },
  amountSection: { alignItems: 'center', paddingVertical: Spacing.xxl },
  amount: { ...Typography.amountLarge, color: Colors.text },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginTop: Spacing.md,
  },
  categoryText: { ...Typography.bodySmall, color: Colors.text, fontWeight: '500' },
  subCategory: { ...Typography.caption, color: Colors.primary, marginTop: Spacing.xs },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm + 2 },
  detailLabel: { ...Typography.bodySmall, color: Colors.textSecondary, marginLeft: Spacing.sm, width: 60 },
  detailValue: { ...Typography.body, color: Colors.text, flex: 1, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: Spacing.md },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    gap: Spacing.sm,
  },
  editBtnText: { ...Typography.body, color: Colors.white, fontWeight: '600' },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: Spacing.sm,
  },
  deleteBtnText: { ...Typography.body, color: Colors.error, fontWeight: '600' },
});
