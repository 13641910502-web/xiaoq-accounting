import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Colors, Typography, Spacing } from '../../src/constants';
import type { Bill } from '../../src/types/bill';

export default function DataScreen() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
      const bills = db.getAllSync<Bill>(
        'SELECT * FROM bills WHERE is_deleted = 0 ORDER BY transaction_date DESC'
      );

      if (bills.length === 0) {
        Alert.alert('提示', '没有可导出的账单数据');
        return;
      }

      const header = '日期,时间,金额,描述,主分类,子分类,来源,备注';
      const rows = bills.map(b => [
        b.transaction_date,
        b.transaction_time ?? '',
        b.amount,
        `"${(b.description ?? '').replace(/"/g, '""')}"`,
        b.main_category ?? '',
        b.sub_category ?? '',
        b.source ?? '',
        `"${(b.note ?? '').replace(/"/g, '""')}"`,
      ].join(','));
      const csv = [header, ...rows].join('\n');

      const filePath = `${FileSystem.documentDirectory}xiaoq_bills_${new Date().toISOString().slice(0, 10)}.csv`;
      await FileSystem.writeAsStringAsync(filePath, csv, { encoding: 'utf8' });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: '导出账单CSV',
        });
      } else {
        Alert.alert('导出成功', `文件已保存至:\n${filePath}\n\n共 ${bills.length} 条记录`);
      }
    } catch (err: any) {
      Alert.alert('导出失败', err.message ?? '未知错误');
    } finally {
      setExporting(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      '清除所有数据',
      '此操作将删除所有账单、预算、分类规则和缓存数据，且不可恢复。确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认清除',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '再次确认',
              '请输入"确认删除"以继续',
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '确认删除',
                  style: 'destructive',
                  onPress: () => {
                    try {
                      const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
                      db.execSync(`
                        DELETE FROM bills;
                        DELETE FROM classification_rules WHERE is_system = 0;
                        DELETE FROM classification_cache;
                        DELETE FROM ocr_cache;
                        DELETE FROM budgets;
                        DELETE FROM import_logs;
                      `);
                      Alert.alert('完成', '所有数据已清除');
                    } catch (err: any) {
                      Alert.alert('清除失败', err.message ?? '未知错误');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const getDbStats = () => {
    try {
      const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
      const bills = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM bills WHERE is_deleted = 0');
      const rules = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM classification_rules');
      const budgets = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM budgets');
      return { bills: bills?.c ?? 0, rules: rules?.c ?? 0, budgets: budgets?.c ?? 0 };
    } catch {
      return { bills: 0, rules: 0, budgets: 0 };
    }
  };

  const stats = getDbStats();

  const options = [
    {
      icon: 'cloud-upload-outline',
      title: '导出账单',
      desc: '将所有账单导出为CSV文件',
      color: Colors.primary,
      loading: exporting,
      onPress: handleExport,
    },
    {
      icon: 'trash-outline',
      title: '清除所有数据',
      desc: '删除所有账单和设置，不可恢复',
      color: Colors.error,
      onPress: handleClearAll,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>数据操作</Text>

      {options.map((opt) => (
        <TouchableOpacity key={opt.title} style={styles.card} onPress={opt.onPress} disabled={opt.loading}>
          <View style={[styles.iconWrap, { backgroundColor: opt.color + '15' }]}>
            {opt.loading ? (
              <ActivityIndicator size="small" color={opt.color} />
            ) : (
              <Ionicons name={opt.icon as any} size={24} color={opt.color} />
            )}
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{opt.title}</Text>
            <Text style={styles.cardDesc}>{opt.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      ))}

      <View style={styles.storageCard}>
        <Text style={styles.storageTitle}>数据概览</Text>
        <View style={styles.storageRow}>
          <Text style={styles.storageLabel}>账单数量</Text>
          <Text style={styles.storageValue}>{stats.bills} 条</Text>
        </View>
        <View style={styles.storageRow}>
          <Text style={styles.storageLabel}>分类规则</Text>
          <Text style={styles.storageValue}>{stats.rules} 条</Text>
        </View>
        <View style={styles.storageRow}>
          <Text style={styles.storageLabel}>预算设置</Text>
          <Text style={styles.storageValue}>{stats.budgets} 个</Text>
        </View>
        <View style={styles.storageRow}>
          <Text style={styles.storageLabel}>数据安全</Text>
          <Text style={styles.storageValue}>纯本地存储</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  sectionTitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  cardDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  storageCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginTop: Spacing.xxl,
  },
  storageTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  storageLabel: { ...Typography.bodySmall, color: Colors.textSecondary },
  storageValue: { ...Typography.bodySmall, color: Colors.text },
});
