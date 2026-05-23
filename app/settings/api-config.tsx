import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { Colors, Typography, Spacing } from '../../src/constants';

export default function ApiConfigScreen() {
  const { apiKey, apiKeyLoaded, loadApiKey, setApiKey, clearApiKey, useAI, setUseAI } = useSettingsStore();
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  useEffect(() => {
    if (apiKey) setInputKey(apiKey);
  }, [apiKey]);

  const handleSave = async () => {
    if (!inputKey.trim()) {
      Alert.alert('错误', '请输入API密钥');
      return;
    }
    await setApiKey(inputKey.trim());
    Alert.alert('成功', 'API密钥已保存');
  };

  const handleClear = () => {
    Alert.alert('清除密钥', '确定要清除已保存的API密钥吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
        style: 'destructive',
        onPress: async () => {
          await clearApiKey();
          setInputKey('');
        },
      },
    ]);
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return '••••••••';
    return key.slice(0, 4) + '••••' + key.slice(-4);
  };

  return (
    <View style={styles.container}>
      {/* AI Toggle */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>AI智能分类</Text>
            <Text style={styles.toggleDesc}>使用Claude API自动分类账单</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, useAI && styles.toggleActive]}
            onPress={() => setUseAI(!useAI)}
          >
            <View style={[styles.toggleKnob, useAI && styles.toggleKnobActive]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* API Key */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Claude API 密钥</Text>
        <Text style={styles.cardDesc}>
          在 https://console.anthropic.com 获取API密钥{'\n'}
          密钥仅存储在本地设备中，不会上传到任何服务器
        </Text>

        <View style={styles.keyInputRow}>
          <TextInput
            style={styles.keyInput}
            value={showKey ? inputKey : (inputKey ? maskKey(inputKey) : '')}
            onChangeText={setInputKey}
            placeholder="sk-ant-api03-..."
            placeholderTextColor={Colors.textTertiary}
            secureTextEntry={!showKey}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowKey(!showKey)}>
            <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>保存密钥</Text>
          </TouchableOpacity>
          {apiKey && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>清除</Text>
            </TouchableOpacity>
          )}
        </View>

        {apiKey && (
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.statusText}>已配置 (推荐使用 Haiku 模型以节省成本)</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
        <Text style={styles.infoText}>
          您的账单描述会发送到Claude API进行分类。财务数据不会离开设备，只有交易描述文本会用于AI分类。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.xs },
  cardDesc: { ...Typography.caption, color: Colors.textTertiary, marginBottom: Spacing.lg, lineHeight: 18 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleInfo: { flex: 1 },
  toggleTitle: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  toggleDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    padding: 3,
  },
  toggleActive: { backgroundColor: Colors.primary },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
  },
  toggleKnobActive: { alignSelf: 'flex-end' },
  keyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  keyInput: {
    flex: 1,
    ...Typography.bodySmall,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  eyeBtn: { padding: Spacing.md },
  btnRow: { flexDirection: 'row', gap: Spacing.md },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { ...Typography.body, color: Colors.white, fontWeight: '600' },
  clearBtn: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  clearBtnText: { ...Typography.body, color: Colors.error },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.xs },
  statusText: { ...Typography.caption, color: Colors.success },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  infoText: { ...Typography.caption, color: Colors.primary, flex: 1, lineHeight: 18 },
});
