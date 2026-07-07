import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MotionButton, ProblemDividerDot, RippleMicBadge, SectionReveal, StaggerItem } from './landingMotion';
import { L } from '../../constants/colors';

// ═══════════════════════════════════════════════════════
//  Shared style helpers
// ═══════════════════════════════════════════════════════

const s = {
  eyebrow: { fontSize: 12, fontWeight: '600' as const, color: L.teal, letterSpacing: 2, textTransform: 'uppercase' as const },
  h1: { fontSize: 26, fontWeight: '700' as const, color: L.navy, letterSpacing: -0.5, lineHeight: 32 },
  h2: { fontSize: 19, fontWeight: '600' as const, color: L.navy, letterSpacing: -0.3, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, color: L.navySoft, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 1 },
  micro: { fontSize: 11, fontWeight: '400' as const, lineHeight: 14 },
  section: (bg: string) => ({ paddingVertical: 40, paddingHorizontal: 24 }),
};

// ═══════════════════════════════════════════════════════
//  1. HERO
// ═══════════════════════════════════════════════════════

type HeroProps = {
  onPressGoogle: () => void;
  onPressEmail?: () => void;
};

export function HeroSection({ onPressGoogle }: HeroProps) {
  return (
    <SectionReveal style={{ minHeight: 680, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 60 }}>
      <StaggerItem index={0}>
        <Image
          source={require('../../assets/logo-light.png')}
          style={{ width: 100, height: 100, borderRadius: 22, marginBottom: 12 }}
          resizeMode="contain"
        />
      </StaggerItem>

      <StaggerItem index={1}>
        <Image
          source={require('../../assets/title.png')}
          style={{ width: 220, height: 44, marginBottom: 8 }}
          resizeMode="contain"
        />
      </StaggerItem>

      <StaggerItem index={2}>
        <Text style={{ fontSize: 17, fontWeight: '400', color: L.teal, textAlign: 'center', marginBottom: 24 }}>
          Every Journey{' '}
          <Text style={{ color: L.terracotta }}>Can Guide Another.</Text>
        </Text>
      </StaggerItem>

      <StaggerItem index={3}>
        <Text style={{ fontSize: 14, fontWeight: '400', color: L.navySoft, textAlign: 'center', lineHeight: 22, maxWidth: '85%', marginBottom: 40 }}>
          Learn from real, verified journeys of founders, professionals, and students who have already walked the path you're considering.
        </Text>
      </StaggerItem>

      <StaggerItem index={4} style={{ width: '100%', maxWidth: 360, gap: 12 }}>
        <MotionButton
          onPress={onPressGoogle}
          style={{
            backgroundColor: L.surface, borderWidth: 1, borderColor: L.border,
            height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
            boxShadow: '0px 6px 20px rgba(21, 34, 56, 0.06)'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('../../assets/google.png')}
              style={{ width: 20, height: 20, marginRight: 16 }}
              resizeMode="contain"
            />
            <Text style={{ color: L.navy, fontSize: 15, fontWeight: '400' }}>Continue with Google</Text>
          </View>
        </MotionButton>
      </StaggerItem>

      <StaggerItem index={5}>
        <Text style={{ fontSize: 11, color: '#15223860', textAlign: 'center', marginTop: 16 }}>
          By continuing you agree to our Terms & Privacy.
        </Text>
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  2. PROBLEM STATEMENT
// ═══════════════════════════════════════════════════════

export function ProblemSection() {
  return (
    <SectionReveal style={s.section(L.background)}>
      <StaggerItem index={0}><Text style={[s.eyebrow, { marginBottom: 12 }]}>THE PROBLEM</Text></StaggerItem>
      <StaggerItem index={1}><Text style={[s.h1, { marginBottom: 16 }]}>The biggest decisions are often made with the least reliable information.</Text></StaggerItem>
      <StaggerItem index={2}><Text style={s.body}>People jump between LinkedIn, Reddit, YouTube, blogs, and AI assistants for important decisions. Every platform shows a different fragment — achievements, opinions, stories — but never the whole journey.</Text></StaggerItem>
      <StaggerItem index={3}>
        <ProblemDividerDot dotColor={L.teal} lineColor={L.border} style={{ marginTop: 48 }} />
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  3. COMPARISON (Fragmented vs Unified)
// ═══════════════════════════════════════════════════════

const PLATFORMS = [
  { icon: '🔗', name: 'LinkedIn', tag: 'Achievements' },
  { icon: '💬', name: 'Reddit', tag: 'Opinions' },
  { icon: '▶️', name: 'YouTube', tag: 'Stories' },
  { icon: '✨', name: 'AI', tag: 'General Advice' },
];

const JOURNEY_TAGS = ['Goals', 'Experiences', 'Skills', 'Decision Transitions', 'Outcomes'];

function SwingingPlusBadge() {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    // Downward motion is snappy/jerky, upward motion is slower for a pendulum-like feel.
    translateY.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 170, easing: Easing.bezier(0.18, 0.92, 0.26, 1) }),
        withTiming(-6, { duration: 760, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 260, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 35,
          height: 35,
          borderRadius: 15,
          backgroundColor: 'rgba(208, 103, 87, 0.16)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        animatedStyle,
      ]}
    >
      <Text style={{ fontSize: 20, lineHeight: 42, color: L.terracotta, fontWeight: '500' }}>+</Text>
    </Animated.View>
  );
}

export function ComparisonSection() {
  return (
    <SectionReveal style={s.section(L.background)}>
      <StaggerItem index={0}><Text style={[s.h2, { textAlign: 'center', marginBottom: 24 }]}>Every platform shows a piece.{"\n"}PathFinder shows the whole picture.</Text></StaggerItem>

      <StaggerItem index={1}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }} contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}>
          {PLATFORMS.map((p, i) => (
            <View key={i} style={{
              width: 120, height: 120, backgroundColor: L.surface, borderRadius: 16,
              borderWidth: 0.5, borderColor: L.teal, alignItems: 'center', justifyContent: 'center', padding: 12,
            }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>{p.icon}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: L.navy, marginBottom: 4 }}>{p.name}</Text>
              <View style={{ backgroundColor: L.tealTint, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, color: L.teal, fontWeight: '400' }}>{p.tag}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </StaggerItem>

      <StaggerItem index={2}>
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <SwingingPlusBadge />
        </View>
      </StaggerItem>

      <StaggerItem index={3}>
        <View style={{ backgroundColor: L.teal, borderRadius: 24, padding: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <MaterialCommunityIcons name="shield-check" size={28} color="#FFFFFF" />
            <Text style={{ fontSize: 18, fontWeight: '400', color: '#FFFFFF', marginLeft: 10 }}>Verified Journeys</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {JOURNEY_TAGS.map((tag, i) => (
              <View key={i} style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: L.surface }}>
                <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '300' }}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 22, marginBottom: 18 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Full Narrative
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="rgba(255,255,255,0.58)" />
          </View>
        </View>
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  4. JOURNEY SEQUENCE (Timeline)
// ═══════════════════════════════════════════════════════

const TIMELINE = [
  { label: 'College', caption: '"Chose projects over grades."', color: L.teal },
  { label: 'Internship', caption: '"Rejected campus placement."', color: L.terracotta },
  { label: 'First Job', caption: '"Interviewed customers before writing code."', color: L.sand },
  { label: 'Startup', caption: '"Prioritized learning over salary."', color: L.teal },
  { label: 'Pivot', caption: '"Followed the data, not the ego."', color: L.terracotta },
  { label: 'Product-Market Fit', caption: '"Built what people actually needed."', color: L.terracotta, isFlag: true },
];

export function JourneySequenceSection() {
  return (
    <SectionReveal style={[s.section(L.background), { borderRadius: 0 }]}>
      <View style={{ backgroundColor: L.surface, borderRadius: 24, padding: 20,paddingVertical:30, borderWidth: 1, borderColor: L.border }}>
        <StaggerItem index={0}><Text style={[s.h1, { marginBottom: 32 }]}>Success isn't a moment.{"\n"}It's a sequence of decisions.</Text></StaggerItem>

        <StaggerItem index={1}>
          <View style={{ position: 'relative', paddingLeft: 24 }}>
            <View style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 2, backgroundColor: L.teal, opacity: 0.2 }} />

            {TIMELINE.map((node, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: i < TIMELINE.length - 1 ? 28 : 0, gap: 22 }}>
                <View style={{ marginLeft: -24, alignItems: 'center', width: 12 }}>
                  {node.isFlag ? (
                    <View style={{width: 30, height: 30, borderRadius: 15,backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginLeft: -10, marginTop: -7, boxShadow: '0px 4px 10px rgba(21, 34, 56, 0.12)'}}>
                      <MaterialCommunityIcons name="flag-variant" size={16} color={L.terracotta} />
                    </View>
                  ) : (
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: node.color, borderWidth: 3, borderColor: L.surface }} />
                  )}
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: L.navy }}>{node.label}</Text>
                  <Text style={{ fontSize: 13, fontStyle: 'italic', color: L.navySoft, marginTop: 4, marginLeft: 4 }}>{node.caption}</Text>
                </View>
              </View>
            ))}
          </View>
        </StaggerItem>
      </View>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  5. SAMPLE QUESTIONS
// ═══════════════════════════════════════════════════════

const QUESTIONS = [
  "How did students prepare for Google internships?",
  "What did founders build before finding product-market fit?",
  "How did engineers transition into AI?",
  "Should I pursue higher studies or gain industry experience first?",
  "What mistakes do bootstrapped founders wish they'd avoided?",
];

export function SampleQuestionsSection() {
  return (
    <SectionReveal style={s.section(L.background)}>
      <StaggerItem index={0}><Text style={[s.h1, { marginBottom: 24 }]}>Ask questions that matter.</Text></StaggerItem>
      <StaggerItem index={1} style={{ gap: 12 }}>
        <View style={{ gap: 12 }}>
          {QUESTIONS.map((q, i) => (
            <View key={i} style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: L.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16,
              borderWidth: 1, borderColor: L.border,
            }}>
              <Text style={{ fontSize: 14, color: L.navy, flex: 1, paddingRight: 12 }}>{q}</Text>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: L.tealTint, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: L.teal, fontSize: 16, fontWeight: '700' }}>›</Text>
              </View>
            </View>
          ))}
        </View>
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  6. HOW IT WORKS (AI)
// ═══════════════════════════════════════════════════════

const STEPS = [
  { icon: 'help', label: 'Ask' },
  { icon: 'chart-line-variant', label: 'Retrieve\njourneys' },
  { icon: 'star-four-points-outline', label: 'See\npatterns' },
] as const;

export function HowItWorksSection() {
  return (
    <SectionReveal style={s.section(L.background)}>
      <StaggerItem index={0}><Text style={[s.eyebrow, { marginBottom: 12 }]}>HOW IT WORKS</Text></StaggerItem>
      <StaggerItem index={1}><Text style={[s.h1, { marginBottom: 16 }]}>Powered by journeys, not assumptions.</Text></StaggerItem>
      <StaggerItem index={2}><Text style={[s.body, { marginBottom: 32 }]}>Unlike standard AI that scrapes static data, PathFinder understands the nuance of real-world paths. Every question you ask triggers a search through a massive knowledge graph built from authentic human experiences.</Text></StaggerItem>
      <StaggerItem index={3}><Text style={[s.body, { marginBottom: 40 }]}>By identifying hidden patterns across thousands of similar milestones, our engine synthesizes a unique narrative strategy tailored to your specific context — turning fragmented data into a unified, actionable insight.</Text></StaggerItem>

      <StaggerItem index={4}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }}>
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <View style={{ alignItems: 'center', width: 92 }}>
                <View style={{
                  width: 52, height: 52, borderRadius: 26,
                  backgroundColor: L.surface,
                  borderWidth: 1, borderColor: '#D5DEDA',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                }}>
                  <MaterialCommunityIcons name={step.icon} size={22} color={L.teal} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '500', color: L.navy, textAlign: 'center' }}>{step.label}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={{ flex: 1, alignItems: 'center', paddingTop: 26 }}>
                  <View style={{ width: '100%', borderTopWidth: 2, borderTopColor: '#AFC1BB', borderStyle: 'dashed', opacity: 0.9 }} />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  9. ACCESSIBILITY
// ═══════════════════════════════════════════════════════

const LANGUAGES = ['हिन्दी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'मराठी'];

export function AccessibilitySection() {
  return (
    <SectionReveal style={s.section(L.background)}>
      <StaggerItem index={0}>
        <View style={{ alignItems: 'flex-start', marginBottom: 18 }}>
          <RippleMicBadge label="NATURAL INTERACTION" />
        </View>
      </StaggerItem>

      <StaggerItem index={1}><Text style={[s.h1, { marginBottom: 16 }]}>Knowledge, accessible to everyone.</Text></StaggerItem>
      <StaggerItem index={2}><Text style={[s.body, { marginBottom: 24 }]}>Users can interact through voice, ask questions naturally, receive insights in multiple Indian languages, and listen instead of read.</Text></StaggerItem>

      <StaggerItem index={3}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {LANGUAGES.map((lang, i) => (
            <View key={i} style={{ backgroundColor: L.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#EAE7E080' }}>
              <Text style={{ fontSize: 13, color: L.teal, fontWeight: '700' }}>{lang}</Text>
            </View>
          ))}
        </View>
      </StaggerItem>

      <StaggerItem index={4}>
        <View style={{ gap: 12 }}>
          <View style={{ backgroundColor: L.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.border }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(53, 108, 101, 0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="translate" size={22} color={L.teal} />
            </View>
            <Text style={{ fontSize: 19, fontWeight: '500', color: L.navy, lineHeight: 24, marginBottom: 6 }}>Native Support</Text>
            <Text style={{ fontSize: 14, fontWeight: '400', color: L.navySoft, lineHeight: 20, letterSpacing:0.1 }}>Switch between languages instantly with perfect semantic translation.</Text>
          </View>
          <View style={{ backgroundColor: L.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.border }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(208, 103, 87, 0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="volume-high" size={22} color={L.terracotta} />
            </View>
            <Text style={{ fontSize: 19, fontWeight: '500', color: L.navy, lineHeight: 24, marginBottom: 6 }}>Read Aloud</Text>
            <Text style={{ fontSize: 14, fontWeight: '400', color: L.navySoft, lineHeight: 20, letterSpacing:0.1 }}>Hear your milestones narrated with human-like, empathetic voice synthesis.</Text>
          </View>
        </View>
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  10. CLOSING VISION
// ═══════════════════════════════════════════════════════

export function ClosingVisionSection() {
  return (
    <SectionReveal style={[s.section(L.background), { paddingVertical: 40,alignItems: 'stretch' }]}>
      <StaggerItem index={0}><Text style={{ color: L.surface, fontSize:18, fontWeight:"500", alignSelf: "flex-start",marginBottom: 56 }}>OUR VISION</Text></StaggerItem>
      <StaggerItem index={1}><Text style={{ fontSize: 24, fontWeight: '400', color: L.surface, textAlign: 'center', lineHeight: 34, marginBottom: 20, maxWidth: '90%', alignSelf: 'center' }}>Imagine if every important decision someone made could help another person make theirs.</Text></StaggerItem>
      <StaggerItem index={2}><Text style={{ fontSize: 14, color: L.surface, textAlign: 'center', lineHeight: 22, maxWidth: '90%', alignSelf: 'center' }}>PathFinder is building a living repository of verified human journeys — to help users understand what others did, why, and what they learned. The more journeys the community contributes, the more valuable it becomes for everyone.</Text></StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  11. FOOTER
// ═══════════════════════════════════════════════════════

export function FooterSection() {
  return (
    <SectionReveal style={{ paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center' }}>
      <StaggerItem index={0}>
        <Image
          source={require('../../assets/logo-dark.png')}
          style={{ width: 52, height: 52, borderRadius: 10, marginBottom: 8, opacity: 0.9 }}
          resizeMode="contain"
        />
      </StaggerItem>
      <StaggerItem index={1}>
        <Image
          source={require("../../assets/title-dark.png")}
          style={{
            width: 220,
            height: 36, 
            marginBottom: 8,
          }}
    resizeMode="contain"
  /></StaggerItem>
      <StaggerItem index={2}><Text style={{ fontSize: 12, color: L.surface, textAlign: 'center', marginBottom: 20 }}>Building collective wisdom through verified journeys.</Text></StaggerItem>

      <StaggerItem index={3}>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
          {['Privacy', 'Terms', 'GitHub', 'Contact'].map((link, i) => (
            <Text key={i} style={{ fontSize: 11, fontWeight: '600', color: L.surface, textTransform: 'uppercase', letterSpacing: 1 }}>
              {link}
            </Text>
          ))}
        </View>
      </StaggerItem>

      <StaggerItem index={4}><Text style={{ fontSize: 10, color: L.surface, textAlign: 'center', marginTop: 8 }}>Powered by Expo, Neo4j, GraphRAG, Gemini, Groq and Sarvam AI.</Text></StaggerItem>
    </SectionReveal>
  );
}
