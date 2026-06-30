import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from 'expo-router';
import { initializeUser } from '@/services/auth.service';
import Starfield from '../components/Starfield';

const C = {
  bg: '#050505',
  surface: '#0e0e0e',
  card: '#141414',
  white: '#FFFFFF',
  offWhite: '#e0e0e0',
  gray: '#888888',
  dimGray: '#555555',
  border: '#1e1e1e',
  gridLine: '#262626',
  accent: '#3a3a3a',
};

const FEATURES = [
  { num: '01', title: 'Life Graphs', desc: 'See how real people navigated their careers — every step, every pivot, every outcome.' },
  { num: '02', title: 'Decision Points', desc: 'Understand the critical choices that shaped someone\'s trajectory and why they made them.' },
  { num: '03', title: 'Community', desc: 'Real people. Real stories. No influencers — just verified journeys you can actually learn from.' },
];

// Soft spotlight glow (uses web-only blur filter for smooth gradients)
function SoftGlow({ top, left, right, bottom, size, opacity = 0.04 }: any) {
  return (
    <View style={{
      position: 'absolute',
      top, left, right, bottom,
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: '#ffffff',
      opacity,
      // @ts-ignore - web specific styling
      filter: 'blur(100px)',
    }} />
  );
}

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
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Starfield count={50} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <View style={{ minHeight: 720, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 100, overflow: 'hidden' }}>
          {/* Soft background glows */}
          <SoftGlow size={600} top={-150} left={-200} opacity={0.03} />
          <SoftGlow size={500} top={400} right={-150} opacity={0.02} />
          
          <Text style={{ color: C.dimGray, fontSize: 13, fontWeight: '500', letterSpacing: 6, textTransform: 'uppercase', marginBottom: 48, zIndex: 1 }}>
            PathFinder
          </Text>

          <Text style={{ color: C.white, fontSize: 52, fontWeight: '700', textAlign: 'center', lineHeight: 62, letterSpacing: -2, marginBottom: 28, zIndex: 1 }}>
            Real Journeys.{"\n"}Better Decisions.
          </Text>

          <Text style={{ color: C.gray, fontSize: 18, textAlign: 'center', lineHeight: 28, maxWidth: 460, marginBottom: 56, zIndex: 1 }}>
            Explore verified career timelines. Learn from real decisions. Chart your own path with confidence.
          </Text>

          <View style={{ width: '100%', maxWidth: 340, gap: 14, zIndex: 1 }}>
            <TouchableOpacity
              onPress={onPressGoogle}
              style={{ backgroundColor: C.white, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: C.bg, fontSize: 15, fontWeight: '600' }}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onPressEmail}
              style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: C.accent }}
            >
              <Text style={{ color: C.dimGray, fontSize: 15, fontWeight: '500' }}>Sign in with Email</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* ── THE PROBLEM ── */}
        <View style={{ paddingHorizontal: 32, paddingVertical: 100, alignItems: 'center', backgroundColor: C.surface }}>
          <View style={{ position: 'absolute', top: 48, left: 32, right: 32, height: 1, backgroundColor: C.border }} />

          <Text style={{ color: C.dimGray, fontSize: 12, fontWeight: '600', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 24 }}>
            The problem
          </Text>

          <Text style={{ color: C.white, fontSize: 36, fontWeight: '700', textAlign: 'center', lineHeight: 46, letterSpacing: -1, maxWidth: 600, marginBottom: 24 }}>
            Career advice is broken.
          </Text>

          <Text style={{ color: C.gray, fontSize: 17, textAlign: 'center', lineHeight: 28, maxWidth: 520 }}>
            Nobody shows you the actual steps. The pivots. The failures. The decisions that mattered. You're left guessing — and that needs to change.
          </Text>

          <View style={{ position: 'absolute', bottom: 48, left: 32, right: 32, height: 1, backgroundColor: C.border }} />
        </View>


        {/* ── HOW IT WORKS ── */}
        <View style={{ paddingHorizontal: 32, paddingVertical: 100, alignItems: 'center', overflow: 'hidden' }}>
          
          <SoftGlow size={700} top={200} left={-300} opacity={0.02} />

          <Text style={{ color: C.dimGray, fontSize: 12, fontWeight: '600', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 24 }}>
            How it works
          </Text>

          <Text style={{ color: C.white, fontSize: 36, fontWeight: '700', textAlign: 'center', lineHeight: 46, letterSpacing: -1, maxWidth: 600, marginBottom: 64 }}>
            See the path before{"\n"}you walk it.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, width: '100%', maxWidth: 900 }}>
            {FEATURES.map((f, i) => (
              <View
                key={i}
                style={{
                  borderWidth: 1, borderColor: C.border, borderRadius: 16,
                  padding: 32, width: '100%', maxWidth: 280, minWidth: 250,
                  backgroundColor: C.surface,
                }}
              >
                <Text style={{ color: C.accent, fontSize: 56, fontWeight: '800', marginBottom: 20, lineHeight: 56 }}>
                  {f.num}
                </Text>
                <Text style={{ color: C.white, fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
                  {f.title}
                </Text>
                <Text style={{ color: C.gray, fontSize: 15, lineHeight: 24 }}>
                  {f.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>


        {/* ── STATS ── */}
        <View style={{ backgroundColor: C.surface, paddingHorizontal: 32, paddingVertical: 72, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 48, maxWidth: 700 }}>
            {[
              { val: '1,200+', label: 'Journeys' },
              { val: '85%', label: 'Found Clarity' },
              { val: '40+', label: 'Industries' },
            ].map((s, i) => (
              <View key={i} style={{ alignItems: 'center', minWidth: 140 }}>
                <Text style={{ fontSize: 44, fontWeight: '700', color: C.white, letterSpacing: -2, marginBottom: 4 }}>
                  {s.val}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '500', color: C.dimGray, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>


        {/* ── FINAL CTA ── */}
        <View style={{ paddingHorizontal: 32, paddingVertical: 100, alignItems: 'center', overflow: 'hidden' }}>
          
          <SoftGlow size={500} bottom={-200} right={-100} opacity={0.03} />

          <Text style={{ color: C.white, fontSize: 36, fontWeight: '700', textAlign: 'center', lineHeight: 46, letterSpacing: -1, marginBottom: 20, zIndex: 1 }}>
            Ready?
          </Text>

          <Text style={{ color: C.gray, fontSize: 17, textAlign: 'center', lineHeight: 28, maxWidth: 400, marginBottom: 48, zIndex: 1 }}>
            Join thousands mapping their careers with clarity.
          </Text>

          <View style={{ width: '100%', maxWidth: 340, gap: 14, zIndex: 1 }}>
            <TouchableOpacity
              onPress={onPressGoogle}
              style={{ backgroundColor: C.white, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: C.bg, fontSize: 15, fontWeight: '600' }}>Get Started — Free</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onPressEmail}
              style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: C.accent }}
            >
              <Text style={{ color: C.dimGray, fontSize: 15, fontWeight: '500' }}>Sign in with Email</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* ── FOOTER ── */}
        <View style={{ paddingVertical: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg }}>
          <Text style={{ color: C.accent, fontSize: 12, fontWeight: '500' }}>© 2025 PathFinder</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
