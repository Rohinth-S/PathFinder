import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeUser } from '@/services/auth.service';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import { L } from '../constants/colors';
import { LandingViewportProvider, useLandingViewport } from '../components/landing/landingMotion';
import {
  HeroSection,
  ProblemSection,
  ComparisonSection,
  JourneySequenceSection,
  SampleQuestionsSection,
  HowItWorksSection,
  AccessibilitySection,
  ClosingVisionSection,
  FooterSection,
} from '../components/landing/LandingSections';

export default function LandingPage() {
  return (
    <LandingViewportProvider>
      <LandingPageContent />
    </LandingViewportProvider>
  );
}

function LandingPageContent() {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { scrollY, viewportHeight, scrollDirection } = useLandingViewport();
  const onScroll = useAnimatedScrollHandler((event) => {
    const nextY = event.contentOffset.y;
    if (nextY > scrollY.value) {
      scrollDirection.value = 1;
    } else if (nextY < scrollY.value) {
      scrollDirection.value = -1;
    }

    scrollY.value = nextY;
  });

  useEffect(() => {
    async function initialize() {
      if (!isSignedIn) return;
      const token = await getToken();
      console.log(token);
      if (!token) return;  
      const user = await initializeUser(token);
      if (user.username) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(tabs)/profile");
      }
    }
    initialize();
  }, [isSignedIn, getToken, router]);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: L.background }}>
      <StatusBar style="dark" />
      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onLayout={(event) => {
          viewportHeight.value = event.nativeEvent.layout.height;
        }}
      >
        <HeroSection onPressGoogle={onPressGoogle} onPressEmail={() => {}} />
        <ProblemSection />
        <ComparisonSection />
        <JourneySequenceSection />
        <SampleQuestionsSection />
        <HowItWorksSection />
        <AccessibilitySection />
        <ClosingVisionSection />
        <FooterSection />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
