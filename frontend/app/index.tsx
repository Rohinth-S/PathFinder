import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from 'expo-router';
import { initializeUser } from '@/services/auth.service';

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  
  // startOAuthFlow allows us to use Google login
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  useEffect(() => {
    // If the user is already signed in, redirect them to the appropriate tab
    async function initialize() {
      if (!isSignedIn) return;
      const token = await getToken();
      if (!token) return;
      
      const user = await initializeUser(token);
      if (user.username) {
          router.replace("/(tabs)");
      } else {
          router.replace("/(tabs)/profile");
      }
    }

    initialize();
  },[isSignedIn, getToken, router]);

  const onPressGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // After setting active session, the useEffect above will trigger the redirect
      }
    } catch (err) {
      console.warn("OAuth error", err);
    }
  };

  const onPressEmail = () => {
    // We can navigate to a dedicated email sign-in page, or just log for now
    console.log("Email sign in clicked - functionality to be added");
  };

  return (
    <View className="flex-1 justify-center items-center bg-brand-white px-6">
      <Image 
        source={require('../assets/logo.jpg')} 
        style={{ width: 280, height: 280, marginBottom: 32 }}
        resizeMode="contain" 
      />
      
      <View className="w-full max-w-sm mb-12">
        <Text className="text-center text-brand-slate text-base leading-6">
          Navigate your career with confidence. Explore verified timelines of professionals, learn from their decisions, and map out your own success story.
        </Text>
      </View>
      
      <View className="w-full max-w-sm gap-4">
        <TouchableOpacity 
          className="bg-brand-rust py-4 px-6 rounded-xl items-center shadow-sm"
          onPress={onPressGoogle}
        >
          <Text className="text-brand-white text-base font-bold">Continue with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-transparent py-4 px-6 rounded-xl items-center border-2 border-brand-navy"
          onPress={onPressEmail}
        >
          <Text className="text-brand-navy text-base font-bold">Sign in with Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
