import "../global.css";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { View, Platform, StyleSheet, ActivityIndicator } from "react-native";
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from "@expo-google-fonts/manrope";
import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from "@expo-google-fonts/instrument-serif";
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent splash from auto-hiding until fonts are ready
SplashScreen.preventAutoHideAsync();

// Token cache implementation for secure storage of session tokens
const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.warn("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_placeholder";

if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  console.warn("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your .env file.");
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF9F6', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF6900" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <View className="flex-1 bg-[#FAF9F6] items-center">
            <View 
              className="flex-1 w-full web:max-w-[480px] web:border-x web:border-[#EAE7E0]"
              style={Platform.OS === 'web' ? { shadowColor: '#152238', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.06, shadowRadius: 20 } : {}}
            >
              <Slot />
            </View>
            {Platform.OS === 'web' && (
              <View nativeID="clerk-captcha" />
            )}
          </View>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
