import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../src/constants';

export default function ImportScreen() {
  const router = useRouter();

  const options = [
    {
      key: 'screenshot',
      title: '截图识别',
      desc: '拍摄微信/支付宝账单截图，自动识别导入',
      icon: 'camera-outline' as const,
      color: '#4ECDC4',
      route: '/import/screenshot',
    },
    {
      key: 'csv',
      title: 'CSV导入',
      desc: '从微信/支付宝导出的账单文件导入',
      icon: 'document-outline' as const,
      color: '#45B7D1',
      route: '/import/csv-preview',
    },
    {
      key: 'manual',
      title: '手动记账',
      desc: '手动输入账单信息，快速记录',
      icon: 'create-outline' as const,
      color: '#6C5CE7',
      route: '/records/edit/new',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>选择记账方式</Text>
      <Text style={styles.subtitle}>支持截图识别、文件导入和手动录入</Text>

      {options.map(opt => (
        <TouchableOpacity
          key={opt.key}
          style={styles.card}
          onPress={() => router.push(opt.route)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: opt.color + '20' }]}>
            <Ionicons name={opt.icon} size={28} color={opt.color} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{opt.title}</Text>
            <Text style={styles.cardDesc}>{opt.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      ))}

      {/* Recent Import Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>导入记录</Text>
        <Text style={styles.statsHint}>最近导入的账单记录将显示在这里</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  title: { ...Typography.h2, color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: { ...Typography.h3, color: Colors.text },
  cardDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  statsCard: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
  },
  statsTitle: { ...Typography.h3, color: Colors.text },
  statsHint: { ...Typography.caption, color: Colors.textTertiary, marginTop: Spacing.xs },
});
