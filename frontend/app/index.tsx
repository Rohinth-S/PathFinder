import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from 'expo-router';
import { initializeUser } from '@/services/auth.service';
import { BRAND_COLORS } from '../constants/colors';

// ── Feature data ──
const FEATURES = [
  {
    icon: '🗺️',
    title: 'Life Graphs',
    desc: 'Visualize real career trajectories as interactive timelines. See education, jobs, pivots, and achievements mapped out step-by-step.',
  },
  {
    icon: '🔀',
    title: 'Decision Points',
    desc: 'Understand the critical choices that shaped someone\'s path. Every pivot, failure, and breakthrough — laid bare.',
  },
  {
    icon: '🤝',
    title: 'Real Community',
    desc: 'No influencer advice. Just real people sharing verified journeys. Ask questions, share yours, build reputation.',
  },
];

const STATS = [
  { value: '1,200+', label: 'Journeys Mapped' },
  { value: '85%', label: 'Users Found Clarity' },
  { value: '40+', label: 'Industries Covered' },
];

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
    console.log("Email sign in clicked - functionality to be added");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND_COLORS.dark }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ═══════════════════════════════════════════
            SECTION 1 — HERO
            ═══════════════════════════════════════════ */}
        <View style={{ backgroundColor: BRAND_COLORS.dark, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 80, alignItems: 'center', justifyContent: 'center', minHeight: 600 }}>
          
          {/* Logo */}
          <Image 
            source={require('../assets/logo.jpg')} 
            style={{ width: 120, height: 120, borderRadius: 28, marginBottom: 40, opacity: 0.95 }}
            resizeMode="contain" 
          />

          {/* Headline */}
          <Text style={{ fontSize: 44, fontWeight: '800', color: BRAND_COLORS.white, textAlign: 'center', letterSpacing: -1, lineHeight: 52, marginBottom: 16 }}>
            Real Journeys.{"\n"}Better Decisions.
          </Text>

          {/* Tagline */}
          <Text style={{ fontSize: 18, color: BRAND_COLORS.mutedText, textAlign: 'center', lineHeight: 28, maxWidth: 440, marginBottom: 48 }}>
            Navigate your career with confidence. Explore verified timelines of professionals, learn from their choices, and chart your own path.
          </Text>

          {/* CTA Buttons */}
          <View style={{ width: '100%', maxWidth: 400, gap: 16 }}>
            <TouchableOpacity 
              onPress={onPressGoogle}
              style={{ backgroundColor: BRAND_COLORS.tealBright, paddingVertical: 18, borderRadius: 16, alignItems: 'center' }}
            >
              <Text style={{ color: BRAND_COLORS.white, fontSize: 16, fontWeight: '700' }}>Continue with Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onPressEmail}
              style={{ paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: BRAND_COLORS.darkBorder }}
            >
              <Text style={{ color: BRAND_COLORS.mutedText, fontSize: 16, fontWeight: '600' }}>Sign in with Email</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* ═══════════════════════════════════════════
            SECTION 2 — THE PROBLEM
            ═══════════════════════════════════════════ */}
        <View style={{ backgroundColor: BRAND_COLORS.darkCard, paddingHorizontal: 24, paddingVertical: 80, alignItems: 'center' }}>
          <View style={{ maxWidth: 600, width: '100%' }}>
            
            <Text style={{ fontSize: 13, fontWeight: '700', color: BRAND_COLORS.tealBright, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              The Problem
            </Text>
            
            <Text style={{ fontSize: 32, fontWeight: '800', color: BRAND_COLORS.white, textAlign: 'center', marginBottom: 20, lineHeight: 40 }}>
              Career advice is broken.
            </Text>
            
            <Text style={{ fontSize: 17, color: BRAND_COLORS.mutedText, textAlign: 'center', lineHeight: 28 }}>
              People tell you "just follow your passion" or "work hard and you'll make it." But nobody shows you the actual steps. The pivots. The failures. The decisions that actually mattered. You're left guessing in the dark.
            </Text>
          </View>
        </View>


        {/* ═══════════════════════════════════════════
            SECTION 3 — HOW IT WORKS (FEATURES)
            ═══════════════════════════════════════════ */}
        <View style={{ backgroundColor: BRAND_COLORS.dark, paddingHorizontal: 24, paddingVertical: 80, alignItems: 'center' }}>
          <View style={{ maxWidth: 900, width: '100%' }}>
            
            <Text style={{ fontSize: 13, fontWeight: '700', color: BRAND_COLORS.tealBright, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              How It Works
            </Text>
            
            <Text style={{ fontSize: 32, fontWeight: '800', color: BRAND_COLORS.white, textAlign: 'center', marginBottom: 48, lineHeight: 40 }}>
              Your career, visualized.
            </Text>

            {/* Feature Cards */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
              {FEATURES.map((f, i) => (
                <View 
                  key={i} 
                  style={{ 
                    backgroundColor: BRAND_COLORS.darkCard, 
                    borderWidth: 1, 
                    borderColor: BRAND_COLORS.darkBorder, 
                    borderRadius: 20, 
                    padding: 28, 
                    width: '100%',
                    maxWidth: 280,
                    minWidth: 260,
                  }}
                >
                  {/* Icon circle */}
                  <View style={{ 
                    width: 56, height: 56, borderRadius: 16, 
                    backgroundColor: BRAND_COLORS.dark, 
                    borderWidth: 1, borderColor: BRAND_COLORS.darkBorder,
                    alignItems: 'center', justifyContent: 'center', marginBottom: 20 
                  }}>
                    <Text style={{ fontSize: 24 }}>{f.icon}</Text>
                  </View>
                  
                  <Text style={{ fontSize: 20, fontWeight: '700', color: BRAND_COLORS.white, marginBottom: 10 }}>
                    {f.title}
                  </Text>
                  <Text style={{ fontSize: 15, color: BRAND_COLORS.mutedText, lineHeight: 24 }}>
                    {f.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>


        {/* ═══════════════════════════════════════════
            SECTION 4 — STATS / SOCIAL PROOF
            ═══════════════════════════════════════════ */}
        <View style={{ backgroundColor: BRAND_COLORS.darkCard, paddingHorizontal: 24, paddingVertical: 64, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 40, maxWidth: 700 }}>
            {STATS.map((s, i) => (
              <View key={i} style={{ alignItems: 'center', minWidth: 160 }}>
                <Text style={{ fontSize: 40, fontWeight: '800', color: BRAND_COLORS.tealBright, marginBottom: 4 }}>
                  {s.value}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: BRAND_COLORS.mutedText, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>


        {/* ═══════════════════════════════════════════
            SECTION 5 — FINAL CTA
            ═══════════════════════════════════════════ */}
        <View style={{ backgroundColor: BRAND_COLORS.dark, paddingHorizontal: 24, paddingVertical: 80, alignItems: 'center' }}>
          <View style={{ 
            maxWidth: 560, width: '100%', alignItems: 'center',
            backgroundColor: BRAND_COLORS.darkCard,
            borderWidth: 1, borderColor: BRAND_COLORS.darkBorder,
            borderRadius: 24, padding: 40,
          }}>
            <Text style={{ fontSize: 30, fontWeight: '800', color: BRAND_COLORS.white, textAlign: 'center', marginBottom: 16, lineHeight: 38 }}>
              Ready to map your{"\n"}success story?
            </Text>
            <Text style={{ fontSize: 16, color: BRAND_COLORS.mutedText, textAlign: 'center', lineHeight: 26, marginBottom: 36 }}>
              Stop guessing. Start planning. Join PathFinder and make your next career move with confidence.
            </Text>

            <View style={{ width: '100%', gap: 14 }}>
              <TouchableOpacity 
                onPress={onPressGoogle}
                style={{ backgroundColor: BRAND_COLORS.tealBright, paddingVertical: 18, borderRadius: 16, alignItems: 'center' }}
              >
                <Text style={{ color: BRAND_COLORS.white, fontSize: 16, fontWeight: '700' }}>Get Started — It's Free</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={onPressEmail}
                style={{ paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: BRAND_COLORS.darkBorder }}
              >
                <Text style={{ color: BRAND_COLORS.mutedText, fontSize: 16, fontWeight: '600' }}>Sign in with Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={{ backgroundColor: BRAND_COLORS.dark, paddingVertical: 32, alignItems: 'center', borderTopWidth: 1, borderTopColor: BRAND_COLORS.darkBorder }}>
          <Text style={{ fontSize: 13, color: BRAND_COLORS.darkBorder, fontWeight: '500' }}>
            © 2025 PathFinder. All rights reserved.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
