import React, { useEffect } from 'react';
import { SafeAreaView, View, Platform } from 'react-native';
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeUser } from '@/services/auth.service';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, interpolateColor } from 'react-native-reanimated';
import { UI } from '../constants/colors';
import { LandingViewportProvider, useLandingViewport } from '../components/landing/landingMotion';
import {
  HeroSection,
  ProblemSection,
  ComparisonSection,
  JourneySequenceSection,
  SampleQuestionsSection,
  HowItWorksSection,
  VerificationSection,
  CommunitySection,
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

  const animatedBgStyle = useAnimatedStyle(() => {
    return { backgroundColor: UI.background, flex: 1 };
  });

  useEffect(() => {
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
    <Animated.View style={animatedBgStyle}>
      <SafeAreaView style={{ flex: 1 }}>
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
          {/* 1. Hero — centered, auth */}
          <HeroSection onPressGoogle={onPressGoogle} />
          <View style={{ height: 1, backgroundColor: UI.fg08, marginHorizontal: 24, marginVertical: 16 }} />

          {/* 2. Problem Statement — left-aligned editorial */}
          <ProblemSection />
          <View style={{ height: 1, backgroundColor: UI.fg08, marginHorizontal: 24, marginVertical: 16 }} />

          {/* 3. Comparison — fragmented → unified */}
          <ComparisonSection />
          <View style={{ height: 1, backgroundColor: UI.fg08, marginHorizontal: 24, marginVertical: 16 }} />

          {/* 4. Journey Sequence — timeline in white card */}
          <JourneySequenceSection />
          <View style={{ height: 1, backgroundColor: UI.fg08, marginHorizontal: 24, marginVertical: 16 }} />

          {/* 5. Sample Questions — question cards */}
          <SampleQuestionsSection />
          <View style={{ height: 1, backgroundColor: UI.fg08, marginHorizontal: 24, marginVertical: 16 }} />

          {/* 6. How It Works — tealTint bg zone */}
          <HowItWorksSection />
          <View style={{ height: 1, backgroundColor: UI.fg08, marginHorizontal: 24, marginVertical: 16 }} />

          {/* 7. Verification & Trust */}
          <VerificationSection />
          <View style={{ height: 1, backgroundColor: UI.fg08, marginHorizontal: 24, marginVertical: 16 }} />

          {/* 8. Community / Collective Knowledge */}
          <CommunitySection />
          <View style={{ height: 1, backgroundColor: UI.fg08, marginHorizontal: 24, marginVertical: 16 }} />

          {/* 9. Accessibility / Voice & Language */}
          <AccessibilitySection />

          {/* 10. Closing Vision — navy bg */}
          <ClosingVisionSection />

          {/* 11. Footer — navy bg continuous */}
          <FooterSection />
        </Animated.ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}
