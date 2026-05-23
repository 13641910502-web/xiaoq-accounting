import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderWidth } from '../../src/constants';
import { useSettingsStore } from '../../src/stores/settingsStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { darkMode, setDarkMode } = useSettingsStore();

  const menuGroups = [
    {
      title: '记账设置',
      items: [
        { icon: 'list-outline', label: '分类管理', desc: '管理主分类和子分类', route: '/settings/categories' },
        { icon: 'git-branch-outline', label: '分类规则', desc: '管理自动分类关键词规则', route: '/settings/rules' },
        { icon: 'key-outline', label: 'AI配置', desc: '设置Claude API密钥', route: '/settings/api-config' },
      ],
    },
    {
      title: '偏好设置',
      items: [
        {
          icon: 'moon-outline',
          label: '深色模式',
          desc: darkMode ? '已开启' : '已关闭',
          route: '',
          right: (
            <TouchableOpacity
              style={[styles.toggle, darkMode && styles.toggleActive]}
              onPress={() => setDarkMode(!darkMode)}
            >
              <View style={[styles.toggleKnob, darkMode && styles.toggleKnobActive]} />
            </TouchableOpacity>
          ),
        },
      ],
    },
    {
      title: '数据管理',
      items: [
        { icon: 'cloud-download-outline', label: '数据管理', desc: '导出/备份/清除数据', route: '/settings/data' },
      ],
    },
    {
      title: '关于',
      items: [
        { icon: 'information-circle-outline', label: '关于小Q记账', desc: '版本 1.0.0', route: '' },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bauhaus header: geometric composition */}
      <View style={styles.header}>
        <View style={styles.headerComposition}>
          <View style={[styles.geoBox, { backgroundColor: Colors.red }]} />
          <View style={[styles.geoBox, { backgroundColor: Colors.blue }]} />
          <View style={[styles.geoBox, { backgroundColor: Colors.yellow }]} />
          <View style={[styles.geoBox, { backgroundColor: Colors.black }]} />
        </View>
        <Text style={styles.appName}>小Q记账</Text>
        <Text style={styles.appDesc}>智能记账，轻松理财</Text>
      </View>

      {menuGroups.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          {group.items.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => item.route ? router.push(item.route) : null}
              activeOpacity={0.6}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon as any} size={20} color={Colors.black} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              {'right' in item ? item.right : (item.route ? <Ionicons name="chevron-forward" size={16} color={Colors.black} /> : null)}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxxl },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.white,
    borderBottomWidth: BorderWidth.heavy,
    borderBottomColor: Colors.black,
    marginBottom: Spacing.md,
  },
  headerComposition: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  geoBox: { width: 20, height: 20 },
  appName: { ...Typography.h2, color: Colors.black },
  appDesc: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: Spacing.xs },
  group: { marginBottom: Spacing.md },
  groupTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: Colors.lightGray,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: { flex: 1 },
  menuLabel: { ...Typography.bodyBold, color: Colors.black },
  menuDesc: { ...Typography.caption, color: Colors.textTertiary, marginTop: 1 },
  toggle: {
    width: 48,
    height: 26,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
    padding: 2,
  },
  toggleActive: { backgroundColor: Colors.black },
  toggleKnob: {
    width: 18,
    height: 18,
    backgroundColor: Colors.black,
  },
  toggleKnobActive: { alignSelf: 'flex-end', backgroundColor: Colors.white },
});
