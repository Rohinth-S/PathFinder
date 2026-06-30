import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from 'expo-router';
import { initializeUser } from '@/services/auth.service';

const { width } = Dimensions.get('window');

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
      }
    } catch (err) {
      console.warn("OAuth error", err);
    }
  };

  const onPressEmail = () => {
    console.log("Email sign in clicked - functionality to be added");
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Section 1: Hero */}
        <View className="items-center bg-brand-white px-6 py-20 min-h-[60vh] justify-center">
          <Image 
            source={require('../assets/logo.jpg')} 
            style={{ width: 200, height: 200, marginBottom: 24 }}
            resizeMode="contain" 
          />
          <View className="w-full max-w-lg items-center">
            <Text className="text-4xl md:text-5xl font-extrabold text-brand-navy tracking-tight mb-4 text-center">
              Real Journeys.{"\n"}Better Decisions.
            </Text>
            <Text className="text-center text-brand-slate text-lg leading-7 mb-10">
              Navigate your career with confidence. Explore verified timelines of professionals, learn from their decisions, and map out your own success story.
            </Text>
            
            <View className="w-full sm:flex-row gap-4 justify-center">
              <TouchableOpacity 
                className="bg-brand-rust py-4 px-8 rounded-xl items-center shadow-sm"
                onPress={onPressGoogle}
              >
                <Text className="text-brand-white text-base font-bold">Continue with Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-transparent py-4 px-8 rounded-xl items-center border-2 border-brand-navy"
                onPress={onPressEmail}
              >
                <Text className="text-brand-navy text-base font-bold">Sign in with Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section 2: The Problem */}
        <View className="bg-brand-cream px-6 py-24 items-center">
          <View className="w-full max-w-2xl">
            <Text className="text-sm font-bold tracking-widest text-brand-rust mb-2 uppercase text-center">The Problem</Text>
            <Text className="text-3xl font-bold text-brand-navy mb-6 text-center">
              The Career Advice Crisis
            </Text>
            <Text className="text-lg text-brand-slate leading-8 text-center">
              Most career advice is generic, subjective, and lacks context. People tell you "just work hard" or "follow your passion", but they don't show you the actual steps they took. It's incredibly difficult to know which path to choose when you can't see the real milestones, decisions, and outcomes that someone else experienced.
            </Text>
          </View>
        </View>

        {/* Section 3: The Solution */}
        <View className="bg-brand-white px-6 py-24 items-center">
          <View className="w-full max-w-4xl">
            <Text className="text-sm font-bold tracking-widest text-brand-rust mb-2 uppercase text-center">The Solution</Text>
            <Text className="text-3xl font-bold text-brand-navy mb-16 text-center">
              Verified Paths to Success
            </Text>

            <View className="flex-row flex-wrap justify-center gap-8">
              {/* Feature 1 */}
              <View className="bg-brand-cream p-8 rounded-2xl w-full md:w-[30%] min-w-[280px]">
                <Text className="text-4xl mb-4">🗺️</Text>
                <Text className="text-xl font-bold text-brand-navy mb-3">Visual Timelines</Text>
                <Text className="text-brand-slate leading-6">
                  See exactly how professionals navigated their careers, step-by-step. Visualize entire lifespans of education, jobs, and side projects in one unified graph.
                </Text>
              </View>

              {/* Feature 2 */}
              <View className="bg-brand-cream p-8 rounded-2xl w-full md:w-[30%] min-w-[280px]">
                <Text className="text-4xl mb-4">🔀</Text>
                <Text className="text-xl font-bold text-brand-navy mb-3">Decision Nodes</Text>
                <Text className="text-brand-slate leading-6">
                  Understand the critical choices, pivots, and even failures that shaped someone's trajectory. Learn the 'why' behind major life moves.
                </Text>
              </View>

              {/* Feature 3 */}
              <View className="bg-brand-cream p-8 rounded-2xl w-full md:w-[30%] min-w-[280px]">
                <Text className="text-4xl mb-4">🤝</Text>
                <Text className="text-xl font-bold text-brand-navy mb-3">Authentic Community</Text>
                <Text className="text-brand-slate leading-6">
                  Connect with peers, share your own graph, and learn from real experiences. Build reputation by sharing verified, transparent data.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 4: The Value & CTA */}
        <View className="bg-brand-navy px-6 py-24 items-center">
          <View className="w-full max-w-2xl items-center">
            <Text className="text-3xl md:text-4xl font-extrabold text-brand-white mb-6 text-center">
              Ready to map your success story?
            </Text>
            <Text className="text-lg text-brand-lightGray leading-8 text-center mb-10">
              Stop guessing. Start planning. Join PathFinder today and use data-backed life graphs to make informed decisions about your next career move.
            </Text>

            <View className="w-full sm:flex-row gap-4 justify-center">
              <TouchableOpacity 
                className="bg-brand-white py-4 px-8 rounded-xl items-center shadow-sm"
                onPress={onPressGoogle}
              >
                <Text className="text-brand-navy text-base font-bold">Continue with Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-transparent py-4 px-8 rounded-xl items-center border-2 border-brand-white"
                onPress={onPressEmail}
              >
                <Text className="text-brand-white text-base font-bold">Sign in with Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
