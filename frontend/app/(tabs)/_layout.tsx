import { Tabs } from 'expo-router';
import { UI } from '../../constants/colors';
import { View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: UI.accent,
        tabBarInactiveTintColor: UI.fg40,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 10,
          fontFamily: 'Manrope_600SemiBold',
          letterSpacing: 0.3,
        },
        tabBarStyle: {
          backgroundColor: Platform.OS === 'web'
            ? 'rgba(250, 249, 246, 0.90)'
            : UI.background,
          borderTopWidth: 1,
          borderTopColor: UI.fg08,
          height: 80,
          paddingBottom: 12,
          paddingTop: 12,
          ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } as any : {}),
        },
      }}
    >
      <Tabs.Screen
        name="community"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  width: 20, height: 3, borderRadius: 1.5,
                  backgroundColor: UI.accent,
                  position: 'absolute', top: -8,
                }} />
              )}
              <Feather name="compass" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ask',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  width: 20, height: 3, borderRadius: 1.5,
                  backgroundColor: UI.accent,
                  position: 'absolute', top: -8,
                }} />
              )}
              <Feather name="search" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  width: 20, height: 3, borderRadius: 1.5,
                  backgroundColor: UI.accent,
                  position: 'absolute', top: -8,
                }} />
              )}
              <Feather name="map" size={22} color={color} />
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
              {focused && (
                <View style={{
                  width: 20, height: 3, borderRadius: 1.5,
                  backgroundColor: UI.accent,
                  position: 'absolute', top: -8,
                }} />
              )}
              <Feather name="user" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
