import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { BorderWidth } from '../../src/constants/spacing';

export default function TabLayout() {
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.white,
        tabBarInactiveTintColor: Colors.midGray,
        tabBarActiveBackgroundColor: Colors.black,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: BorderWidth.heavy,
          borderTopColor: Colors.black,
          borderBottomWidth: isWeb ? BorderWidth.normal : 0,
          borderBottomColor: Colors.black,
          paddingBottom: isWeb ? 0 : 4,
          height: isWeb ? 52 : 60,
        },
        tabBarItemStyle: {
          borderRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: isWeb ? 12 : 10,
          fontWeight: '800',
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        tabBarPosition: isWeb ? 'top' : 'bottom',
        headerStyle: {
          backgroundColor: Colors.white,
          borderBottomWidth: BorderWidth.normal,
          borderBottomColor: Colors.black,
        },
        headerTitleStyle: {
          color: Colors.black,
          fontWeight: '800',
          fontSize: 16,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: '概览',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '账单',
          headerTitle: '账单',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          title: '记账',
          headerTitle: '记账',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add" size={size + 4} color={Colors.red} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: '预算',
          headerTitle: '预算',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '我的',
          headerTitle: '设置',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
