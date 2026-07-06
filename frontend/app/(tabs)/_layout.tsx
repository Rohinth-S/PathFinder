import { Tabs } from 'expo-router';
import { BRAND_COLORS } from '../../constants/colors';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND_COLORS.teal,
        tabBarInactiveTintColor: BRAND_COLORS.slate,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 10,
        },
        tabBarStyle: {
          backgroundColor: BRAND_COLORS.cream,
          borderTopWidth: 1,
          borderTopColor: BRAND_COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              {focused && <View className="w-1 h-1 bg-brand-teal rounded-full absolute -top-2" />}
              <Feather name="home" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              {focused && <View className="w-1 h-1 bg-brand-teal rounded-full absolute -top-2" />}
              <Feather name="clock" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              {focused && <View className="w-1 h-1 bg-brand-teal rounded-full absolute -top-2" />}
              <Feather name="users" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              {focused && <View className="w-1 h-1 bg-brand-teal rounded-full absolute -top-2" />}
              <Feather name="user" size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
