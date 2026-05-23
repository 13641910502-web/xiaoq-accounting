import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeDatabase } from '../src/services/database';
import { useSettingsStore } from '../src/stores/settingsStore';
import { Colors } from '../src/constants/colors';
import { BorderWidth } from '../src/constants/spacing';

const headerStyle = {
  backgroundColor: Colors.white,
  borderBottomWidth: BorderWidth.normal,
  borderBottomColor: Colors.black,
} as const;

const headerTitleStyle = {
  color: Colors.black,
  fontWeight: '800' as const,
  fontSize: 15,
  letterSpacing: 1,
  textTransform: 'uppercase' as const,
};

export default function RootLayout() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const loadApiKey = useSettingsStore((s) => s.loadApiKey);

  useEffect(() => {
    initializeDatabase();
    loadApiKey();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle,
          headerTitleStyle,
          headerTintColor: Colors.black,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="records/edit/new" options={{ title: '添加账单', headerShown: true, presentation: 'modal' }} />
        <Stack.Screen name="records/edit/[id]" options={{ title: '编辑账单', headerShown: true, presentation: 'modal' }} />
        <Stack.Screen name="import/screenshot" options={{ title: '截图识别', headerShown: true, presentation: 'modal' }} />
        <Stack.Screen name="import/csv-preview" options={{ title: 'CSV导入', headerShown: true, presentation: 'modal' }} />
        <Stack.Screen name="budget/[category]" options={{ title: '预算详情', headerShown: true }} />
        <Stack.Screen name="budget/edit" options={{ title: '编辑预算', headerShown: true, presentation: 'modal' }} />
        <Stack.Screen name="settings/categories" options={{ title: '分类管理', headerShown: true }} />
        <Stack.Screen name="settings/rules" options={{ title: '规则管理', headerShown: true }} />
        <Stack.Screen name="settings/api-config" options={{ title: 'AI配置', headerShown: true }} />
        <Stack.Screen name="settings/data" options={{ title: '数据管理', headerShown: true }} />
      </Stack>
    </>
  );
}
