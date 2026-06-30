import "../global.css";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { View, Platform, StyleSheet } from "react-native";

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
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <View className="flex-1 bg-[#E8ECF2] items-center">
          <View 
            className="flex-1 w-full web:max-w-[480px] web:border-x web:border-[#D1D5DB]"
            style={Platform.OS === 'web' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20 } : {}}
          >
            <Slot />
          </View>
        </View>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
