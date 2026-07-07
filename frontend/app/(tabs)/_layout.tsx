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
        tabBarInactiveTintColor: BRAND_COLORS.slateMuted,
        tabBarLabelStyle: {
          fontWeight: '300',
          fontSize: 10,
        },
        tabBarStyle: {
          backgroundColor: BRAND_COLORS.cream,
          borderTopWidth: 1,
          borderTopColor: BRAND_COLORS.border,
          height: 76,
          paddingBottom: 10,
          paddingTop: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
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
          title: 'HISTORY',
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
          title: 'COMMUNITY',
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
          title: 'PROFILE',
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
