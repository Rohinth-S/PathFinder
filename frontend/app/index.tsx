import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from 'expo-router';
import { initializeUser } from '@/services/auth.service';

const C = {
  bg: '#000000',
  white: '#FFFFFF',
  gray: '#888888',
  dimGray: '#555555',
  border: '#222222',
  dot: '#1a1a1a',
  accent: '#333333',
};

const FEATURES = [
  { title: 'Life Graphs', desc: 'See how real people navigated their careers — every step, every pivot, every outcome.' },
  { title: 'Decision Points', desc: 'Understand the critical choices that shaped someone\'s trajectory and why they made them.' },
  { title: 'Community', desc: 'Real people. Real stories. No influencers — just verified journeys you can actually learn from.' },
];

// Subtle dot grid overlay
function DotGrid() {
  const dots = [];
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 12; col++) {
      dots.push(
        <View
          key={`${row}-${col}`}
          style={{
            position: 'absolute',
            top: row * 40 + 20,
            left: `${col * 8.33}%`,
            width: 1.5,
            height: 1.5,
            borderRadius: 1,
            backgroundColor: C.dot,
          }}
        />
      );
    }
  }
  return <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>{dots}</View>;
}

// Decorative ring
function Ring({ size, top, left, opacity = 0.06 }: { size: number; top: number; left: string; opacity?: number }) {
  return (
    <View style={{
      position: 'absolute', top, left: left as any,
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 1, borderColor: C.white,
      opacity,
    }} />
  );
}

// Thin decorative crosshair
function Crosshair({ top, left }: { top: number; left: string }) {
  return (
    <View style={{ position: 'absolute', top, left: left as any, opacity: 0.08 }}>
      <View style={{ width: 24, height: 1, backgroundColor: C.white, position: 'absolute', top: 12, left: 0 }} />
      <View style={{ width: 1, height: 24, backgroundColor: C.white, position: 'absolute', top: 0, left: 12 }} />
    </View>
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
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <View style={{ minHeight: 700, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 100, overflow: 'hidden' }}>
          {/* Background texture */}
          <DotGrid />
          <Ring size={500} top={-100} left="60%" opacity={0.04} />
          <Ring size={300} top={400} left="-10%" opacity={0.03} />
          <Crosshair top={120} left="15%" />
          <Crosshair top={520} left="80%" />

          {/* Subtle glow behind headline */}
          <View style={{
            position: 'absolute', top: '30%', left: '25%',
            width: 300, height: 300, borderRadius: 150,
            backgroundColor: '#ffffff', opacity: 0.015,
          }} />

          <Text style={{ color: C.dimGray, fontSize: 13, fontWeight: '500', letterSpacing: 6, textTransform: 'uppercase', marginBottom: 48 }}>
            PathFinder
          </Text>

          <Text style={{ color: C.white, fontSize: 52, fontWeight: '700', textAlign: 'center', lineHeight: 62, letterSpacing: -2, marginBottom: 28 }}>
            Real Journeys.{"\n"}Better Decisions.
          </Text>

          <Text style={{ color: C.gray, fontSize: 18, textAlign: 'center', lineHeight: 28, maxWidth: 460, marginBottom: 56 }}>
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
              style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border }}
            >
              <Text style={{ color: C.dimGray, fontSize: 15, fontWeight: '500' }}>Sign in with Email</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* ── DIVIDER ── */}
        <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: 32 }} />


        {/* ── THE PROBLEM ── */}
        <View style={{ paddingHorizontal: 32, paddingVertical: 100, alignItems: 'center', overflow: 'hidden' }}>
          {/* Decorative accent line */}
          <View style={{ position: 'absolute', top: 60, right: '10%', width: 60, height: 1, backgroundColor: C.white, opacity: 0.06 }} />

          <Text style={{ color: C.dimGray, fontSize: 12, fontWeight: '600', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 24 }}>
            The problem
          </Text>

          <Text style={{ color: C.white, fontSize: 36, fontWeight: '700', textAlign: 'center', lineHeight: 46, letterSpacing: -1, maxWidth: 600, marginBottom: 24 }}>
            Career advice is broken.
          </Text>

          <Text style={{ color: C.gray, fontSize: 17, textAlign: 'center', lineHeight: 28, maxWidth: 520 }}>
            Nobody shows you the actual steps. The pivots. The failures. The decisions that mattered. You're left guessing — and that needs to change.
          </Text>
        </View>


        {/* ── DIVIDER ── */}
        <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: 32 }} />


        {/* ── HOW IT WORKS ── */}
        <View style={{ paddingHorizontal: 32, paddingVertical: 100, alignItems: 'center', overflow: 'hidden' }}>
          <Ring size={200} top={30} left="75%" opacity={0.04} />
          <Crosshair top={60} left="5%" />

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
                }}
              >
                {/* Small decorative number */}
                <Text style={{ color: C.accent, fontSize: 48, fontWeight: '700', marginBottom: 16, lineHeight: 48 }}>
                  0{i + 1}
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


        {/* ── DIVIDER ── */}
        <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: 32 }} />


        {/* ── FINAL CTA ── */}
        <View style={{ paddingHorizontal: 32, paddingVertical: 100, alignItems: 'center', overflow: 'hidden' }}>
          <Ring size={400} top={-50} left="-20%" opacity={0.03} />

          <Text style={{ color: C.white, fontSize: 36, fontWeight: '700', textAlign: 'center', lineHeight: 46, letterSpacing: -1, marginBottom: 20 }}>
            Ready?
          </Text>

          <Text style={{ color: C.gray, fontSize: 17, textAlign: 'center', lineHeight: 28, maxWidth: 400, marginBottom: 48 }}>
            Join thousands mapping their careers with clarity.
          </Text>

          <View style={{ width: '100%', maxWidth: 340, gap: 14 }}>
            <TouchableOpacity
              onPress={onPressGoogle}
              style={{ backgroundColor: C.white, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: C.bg, fontSize: 15, fontWeight: '600' }}>Get Started — Free</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onPressEmail}
              style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border }}
            >
              <Text style={{ color: C.dimGray, fontSize: 15, fontWeight: '500' }}>Sign in with Email</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* ── FOOTER ── */}
        <View style={{ paddingVertical: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border }}>
          <Text style={{ color: C.border, fontSize: 12, fontWeight: '500' }}>© 2025 PathFinder</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
