import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderWidth } from '../../src/constants';

export default function ImportScreen() {
  const router = useRouter();

  const options = [
    {
      key: 'screenshot',
      title: '截图识别',
      desc: '拍摄微信/支付宝账单截图，自动识别导入',
      icon: 'camera-outline' as const,
      color: Colors.red,
    },
    {
      key: 'csv',
      title: 'CSV导入',
      desc: '从微信/支付宝导出的账单文件导入',
      icon: 'document-outline' as const,
      color: Colors.blue,
    },
    {
      key: 'manual',
      title: '手动记账',
      desc: '手动输入账单信息，快速记录',
      icon: 'create-outline' as const,
      color: Colors.yellow,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>选择记账方式</Text>
      <View style={styles.titleBar} />
      <Text style={styles.subtitle}>支持截图识别、文件导入和手动录入</Text>

      {options.map(opt => (
        <TouchableOpacity
          key={opt.key}
          style={styles.card}
          onPress={() => router.push('/import/screenshot')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconSquare, { backgroundColor: opt.color }]}>
            <Ionicons name={opt.icon} size={24} color={Colors.white} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{opt.title}</Text>
            <Text style={styles.cardDesc}>{opt.desc}</Text>
          </View>
          <View style={styles.arrowSquare}>
            <Ionicons name="arrow-forward" size={16} color={Colors.black} />
          </View>
        </TouchableOpacity>
      ))}

      {/* Recent Import Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>导入记录</Text>
        <Text style={styles.statsHint}>最近导入的账单记录将显示在这里</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  title: { ...Typography.h1, color: Colors.black },
  titleBar: {
    width: 48,
    height: BorderWidth.heavy,
    backgroundColor: Colors.blue,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  subtitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconSquare: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: { ...Typography.bodyBold, color: Colors.black },
  cardDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  arrowSquare: {
    width: 32,
    height: 32,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.white,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
    borderLeftWidth: BorderWidth.heavy,
    borderLeftColor: Colors.yellow,
    padding: Spacing.lg,
  },
  statsLabel: { ...Typography.label, color: Colors.black, marginBottom: Spacing.xs },
  statsHint: { ...Typography.caption, color: Colors.textTertiary },
});
