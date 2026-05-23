import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

export default function TabLayout() {
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: isWeb ? 0 : 4,
          height: isWeb ? 48 : 56,
        },
        tabBarLabelStyle: {
          fontSize: isWeb ? 13 : 11,
          fontWeight: '500',
        },
        tabBarPosition: isWeb ? 'top' : 'bottom',
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTitleStyle: {
          color: Colors.text,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: '概览',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '账单',
          headerTitle: '账单列表',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          title: '记账',
          headerTitle: '导入账单',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size + 6} color={Colors.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: '预算',
          headerTitle: '预算管理',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '我的',
          headerTitle: '设置',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
