import { Tabs } from 'expo-router';
import { L } from '../../constants/colors';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: L.teal,
        tabBarInactiveTintColor: `${L.navySoft}88`,
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 10,
          fontFamily: 'Manrope_600SemiBold',
        },
        tabBarStyle: {
          backgroundColor: L.surface,
          borderTopWidth: 1,
          borderTopColor: L.border,
          height: 76,
          paddingBottom: 10,
          paddingTop: 12,
        },
      }}
    >
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: L.teal, position: 'absolute', top: -8 }} />}
              <Feather name="users" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: L.teal, position: 'absolute', top: -8 }} />}
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
            <View style={{ alignItems: 'center' }}>
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: L.teal, position: 'absolute', top: -8 }} />}
              <Feather name="clock" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: L.teal, position: 'absolute', top: -8 }} />}
              <Feather name="user" size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
