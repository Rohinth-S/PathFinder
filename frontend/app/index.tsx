import React, { useEffect } from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeUser } from '@/services/auth.service';
import { L } from '../constants/colors';
import {
  HeroSection,
  ProblemSection,
  ComparisonSection,
  JourneySequenceSection,
  SampleQuestionsSection,
  HowItWorksSection,
  TrustSection,
  CommunitySection,
  AccessibilitySection,
  ClosingVisionSection,
  FooterSection,
} from '../components/landing/LandingSections';

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

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

  const onPressEmail = () => {
    console.log("Email sign in clicked");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: L.background }}>
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <HeroSection onPressGoogle={onPressGoogle} onPressEmail={onPressEmail} />
        <ProblemSection />
        <ComparisonSection />
        <JourneySequenceSection />
        <SampleQuestionsSection />
        <HowItWorksSection />
        <TrustSection />
        <CommunitySection />
        <AccessibilitySection />
        <ClosingVisionSection />
        <FooterSection />
      </ScrollView>
    </SafeAreaView>
  );
}
