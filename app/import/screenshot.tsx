import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing } from '../../src/constants';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useBillStore } from '../../src/stores/billStore';
import { useChartStore } from '../../src/stores/chartStore';
import { recognizeImage } from '../../src/services/ocr/recognizer';
import { parseOcrText } from '../../src/services/ocr/parser';
import { validateOcrResult } from '../../src/services/ocr/validator';
import { classifyTransaction } from '../../src/services/classification/engine';
import { generateId } from '../../src/utils/id';
import { formatAmount } from '../../src/utils/currency';
import type { OcrResult } from '../../src/types/import';
import type { BillInput } from '../../src/types/bill';

export default function ScreenshotScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [results, setResults] = useState<(OcrResult & { id: string; errors?: { field: string; message: string }[] })[]>([]);
  const [recognizing, setRecognizing] = useState(false);
  const [importing, setImporting] = useState(false);
  const apiKey = useSettingsStore(s => s.apiKey);
  const fetchBills = useBillStore(s => s.fetchBills);
  const loadDashboard = useChartStore(s => s.loadDashboard);
  const selectedMonth = useChartStore(s => s.selectedMonth);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0].uri);
      setResults([]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '请在设置中允许访问相机');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0].uri);
      setResults([]);
    }
  };

  const handleRecognize = useCallback(async () => {
    if (!image) return;
    if (!apiKey) {
      Alert.alert('需要API密钥', '请在"我的→AI配置"中设置Claude API密钥');
      return;
    }

    setRecognizing(true);
    try {
      const { rawText } = await recognizeImage(apiKey, image);

      let parsed: OcrResult[];
      try {
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = parseOcrText(rawText);
        }
      } catch {
        parsed = parseOcrText(rawText);
      }

      if (parsed.length === 0) {
        Alert.alert('未识别到账单', '未能从截图中识别出账单信息，请确保截图清晰完整。');
        return;
      }

      const withIds = parsed.map(r => {
        const errors = validateOcrResult(r);
        return { ...r, id: generateId(), errors: errors.length > 0 ? errors : undefined };
      });

      setResults(withIds);
    } catch (err: any) {
      Alert.alert('识别失败', err.message ?? 'OCR识别出错，请重试');
    } finally {
      setRecognizing(false);
    }
  }, [image, apiKey]);

  const updateResultField = (id: string, field: keyof OcrResult, value: string | number) => {
    setResults(prev => prev.map(r =>
      r.id === id ? { ...r, [field]: value, errors: undefined } : r
    ));
  };

  const removeResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const handleImport = useCallback(async () => {
    if (results.length === 0) return;
    setImporting(true);

    const batchId = generateId();
    let successCount = 0;

    try {
      for (const result of results) {
        if (result.errors && result.errors.length > 0) continue;

        const classification = await classifyTransaction(result.description, { apiKey: apiKey ?? undefined });

        const input: BillInput = {
          amount: result.amount,
          transaction_date: result.transaction_date,
          transaction_time: result.transaction_time ?? undefined,
          description: result.description,
          main_category: classification.mainCategory,
          sub_category: classification.subCategory ?? undefined,
          source: 'ocr' as const,
          import_batch_id: batchId,
          raw_data: JSON.stringify(result),
          note: undefined,
        };

        useBillStore.getState().addBill(input);
        successCount++;
      }

      fetchBills();
      loadDashboard(selectedMonth);

      Alert.alert(
        '导入完成',
        `成功导入 ${successCount}/${results.length} 条记录`,
        [{ text: '确定', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('导入失败', err.message ?? '未知错误');
    } finally {
      setImporting(false);
    }
  }, [results, apiKey, fetchBills, loadDashboard, selectedMonth, router]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>截图识别</Text>
        <View style={styles.backBtn} />
      </View>

      {!image ? (
        <View style={styles.actions}>
          <Text style={styles.hint}>请选择微信或支付宝账单截图</Text>
          <Text style={styles.subHint}>确保截图清晰完整，包含金额和商户名称</Text>

          <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
            <Ionicons name="camera" size={28} color={Colors.white} />
            <Text style={styles.actionBtnText}>拍照</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.pickBtn]} onPress={pickImage}>
            <Ionicons name="images" size={28} color={Colors.primary} />
            <Text style={[styles.actionBtnText, { color: Colors.primary }]}>从相册选择</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="contain" />
            {recognizing && (
              <View style={styles.recognizingOverlay}>
                <ActivityIndicator size="large" color={Colors.white} />
                <Text style={styles.recognizingText}>正在识别...</Text>
              </View>
            )}
          </View>

          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={r => r.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={[styles.resultCard, item.errors?.length ? styles.resultCardError : null]}>
                  <View style={styles.resultRow}>
                    <View style={styles.resultField}>
                      <Text style={styles.fieldLabel}>金额</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={String(item.amount)}
                        onChangeText={v => updateResultField(item.id, 'amount', parseFloat(v) || 0)}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.resultField}>
                      <Text style={styles.fieldLabel}>日期</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={item.transaction_date}
                        onChangeText={v => updateResultField(item.id, 'transaction_date', v)}
                      />
                    </View>
                    <TouchableOpacity onPress={() => removeResult(item.id)} style={styles.removeBtn}>
                      <Ionicons name="close-circle" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.resultField}>
                    <Text style={styles.fieldLabel}>描述</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={item.description}
                      onChangeText={v => updateResultField(item.id, 'description', v)}
                    />
                  </View>
                  {item.errors?.map((e, i) => (
                    <Text key={i} style={styles.errorText}>{e.message}</Text>
                  ))}
                </View>
              )}
              ListHeaderComponent={
                <Text style={styles.sectionTitle}>
                  识别到 {results.length} 条记录（点击字段可编辑）
                </Text>
              }
              ListFooterComponent={
                <View style={styles.batchActions}>
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => { setImage(null); setResults([]); }}
                    disabled={importing}
                  >
                    <Text style={styles.retakeText}>重新选择</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.importBtn, importing && styles.btnDisabled]}
                    onPress={handleImport}
                    disabled={importing}
                  >
                    {importing ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Ionicons name="cloud-upload-outline" size={20} color={Colors.white} />
                    )}
                    <Text style={styles.importBtnText}>
                      {importing ? '导入中...' : '确认导入'}
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          ) : (
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.retakeBtn} onPress={() => setImage(null)}>
                <Text style={styles.retakeText}>重新选择</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.recognizeBtn, recognizing && styles.btnDisabled]}
                onPress={handleRecognize}
                disabled={recognizing}
              >
                {recognizing ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="scan" size={20} color={Colors.white} />
                )}
                <Text style={styles.recognizeText}>
                  {recognizing ? '识别中...' : '开始识别'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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

  actions: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  hint: { ...Typography.body, color: Colors.text, marginBottom: Spacing.xs },
  subHint: { ...Typography.caption, color: Colors.textTertiary, marginBottom: Spacing.xxxl, textAlign: 'center' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    width: '80%',
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  pickBtn: { backgroundColor: Colors.primaryLight },
  actionBtnText: { ...Typography.body, color: Colors.white, fontWeight: '600' },

  content: { flex: 1 },
  previewContainer: { height: 220, position: 'relative' },
  previewImage: { width: '100%', height: '100%' },
  recognizingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  recognizingText: { ...Typography.body, color: Colors.white },
  list: { flex: 1 },
  listContent: { padding: Spacing.lg },
  sectionTitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.md },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultCardError: { borderColor: Colors.error },
  resultRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  resultField: { flex: 1 },
  fieldLabel: { ...Typography.caption, color: Colors.textTertiary, marginBottom: 2 },
  fieldInput: {
    ...Typography.bodySmall,
    color: Colors.text,
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeBtn: { padding: 4, alignSelf: 'flex-end' },
  errorText: { ...Typography.caption, color: Colors.error, marginTop: 2 },
  batchActions: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  retakeBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  retakeText: { ...Typography.body, color: Colors.textSecondary },
  previewActions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    gap: Spacing.md,
  },
  recognizeBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  recognizeText: { ...Typography.body, color: Colors.white, fontWeight: '600' },
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
  btnDisabled: { opacity: 0.6 },
});
