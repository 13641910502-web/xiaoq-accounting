import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Typography, Spacing } from '../../src/constants';
import { parseCsvFile, type CsvRow } from '../../src/services/csv/parser';
import { useBillStore } from '../../src/stores/billStore';
import { useChartStore } from '../../src/stores/chartStore';
import { createImportLog, updateImportLog } from '../../src/services/database/importLogs';
import { generateId } from '../../src/utils/id';
import { formatAmount } from '../../src/utils/currency';
import { classifyBatch } from '../../src/services/classification/engine';
import type { BillInput } from '../../src/types/bill';

export default function CsvPreviewScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [source, setSource] = useState<'wechat' | 'alipay' | 'unknown'>('unknown');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fetchBills = useBillStore(s => s.fetchBills);
  const loadDashboard = useChartStore(s => s.loadDashboard);
  const selectedMonth = useChartStore(s => s.selectedMonth);

  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', '*/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setFileName(file.name);
        const content = await FileSystem.readAsStringAsync(file.uri, { encoding: 'utf8' });
        const parsed = parseCsvFile(content);
        setRows(parsed.rows);
        setSource(parsed.source);
        if (parsed.rows.length === 0) {
          Alert.alert('提示', '未能从文件中解析出有效账单记录，请检查文件格式。');
        }
      }
    } catch (err: any) {
      Alert.alert('解析失败', err.message ?? '无法读取文件');
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (rows.length === 0) return;
    setImporting(true);
    setProgress(0);

    const batchId = generateId();
    const importLog = createImportLog(source === 'wechat' ? 'csv_wechat' : source === 'alipay' ? 'csv_alipay' : 'manual', fileName);

    try {
      // Step 1: classify all descriptions
      const descriptions = rows.map(r => r.description).filter(Boolean);
      setProgress(10);
      const classifications = await classifyBatch(descriptions);
      setProgress(30);

      // Step 2: build bill inputs
      const inputs: BillInput[] = rows.map((row, i) => ({
        amount: row.amount,
        transaction_date: row.date,
        transaction_time: undefined,
        description: row.description || '未知消费',
        main_category: classifications[i]?.mainCategory ?? '其他',
        sub_category: classifications[i]?.subCategory ?? undefined,
        source: source === 'wechat' ? 'wechat' : source === 'alipay' ? 'alipay' : 'csv',
        import_batch_id: batchId,
        raw_data: JSON.stringify(row),
        note: undefined,
      }));
      setProgress(50);

      // Step 3: batch insert
      let successCount = 0;
      for (let i = 0; i < inputs.length; i++) {
        try {
          useBillStore.getState().addBill(inputs[i]);
          successCount++;
        } catch { /* skip duplicates */ }
        setProgress(50 + Math.floor((i + 1) / inputs.length * 40));
      }

      updateImportLog(importLog.id, {
        total_rows: rows.length,
        success_count: successCount,
        status: 'completed',
      });

      setProgress(100);
      fetchBills();
      loadDashboard(selectedMonth);

      Alert.alert(
        '导入完成',
        `成功导入 ${successCount}/${rows.length} 条记录\n${successCount < rows.length ? '部分记录因重复已被跳过' : ''}`,
        [{ text: '确定', onPress: () => router.back() }]
      );
    } catch (err: any) {
      updateImportLog(importLog.id, { status: 'failed', error_message: err.message });
      Alert.alert('导入失败', err.message ?? '未知错误');
    } finally {
      setImporting(false);
    }
  }, [rows, source, fileName, fetchBills, loadDashboard, selectedMonth, router]);

  const sourceLabel = source === 'wechat' ? '微信' : source === 'alipay' ? '支付宝' : '通用';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CSV导入</Text>
        <View style={styles.backBtn} />
      </View>

      {rows.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>导入CSV账单</Text>
          <Text style={styles.emptyDesc}>
            支持微信和支付宝导出的CSV账单文件{'\n'}
            系统将自动识别列对应关系和分类
          </Text>
          <TouchableOpacity style={styles.pickBtn} onPress={pickFile}>
            <Ionicons name="folder-open-outline" size={22} color={Colors.white} />
            <Text style={styles.pickBtnText}>选择文件</Text>
          </TouchableOpacity>
          {fileName ? <Text style={styles.fileName}>已选择: {fileName}</Text> : null}
        </View>
      ) : importing ? (
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>正在导入...</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.infoRow}>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>{sourceLabel}</Text>
            </View>
            <Text style={styles.rowCount}>共 {rows.length} 条记录</Text>
          </View>

          <FlatList
            data={rows}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View style={styles.rowItem}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowDate}>{item.date}</Text>
                  <Text style={styles.rowDesc} numberOfLines={1}>{item.description || '未知消费'}</Text>
                </View>
                <Text style={styles.rowAmount}>{formatAmount(item.amount)}</Text>
              </View>
            )}
            style={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.reselectBtn} onPress={() => { setRows([]); setFileName(''); }}>
              <Text style={styles.reselectText}>重新选择</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
              <Ionicons name="cloud-upload-outline" size={20} color={Colors.white} />
              <Text style={styles.importBtnText}>确认导入</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { ...Typography.h3, color: Colors.text },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { ...Typography.h3, color: Colors.text, marginTop: Spacing.lg },
  emptyDesc: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  pickBtnText: { ...Typography.body, color: Colors.white, fontWeight: '600' },
  fileName: { ...Typography.caption, color: Colors.primary, marginTop: Spacing.md },

  progressContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  progressTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.xl },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  progressText: { ...Typography.caption, color: Colors.textSecondary, marginTop: Spacing.md },

  content: { flex: 1, paddingHorizontal: Spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  infoBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  infoBadgeText: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
  rowCount: { ...Typography.body, color: Colors.textSecondary },
  list: { flex: 1 },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  rowLeft: { flex: 1, marginRight: Spacing.md },
  rowDate: { ...Typography.caption, color: Colors.textTertiary },
  rowDesc: { ...Typography.bodySmall, color: Colors.text, marginTop: 2 },
  rowAmount: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  separator: { height: 1, backgroundColor: Colors.border },
  actions: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  reselectBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  reselectText: { ...Typography.body, color: Colors.textSecondary },
  importBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  importBtnText: { ...Typography.body, color: Colors.white, fontWeight: '600' },
});
