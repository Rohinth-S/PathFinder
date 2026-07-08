import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Feather } from '@expo/vector-icons';
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
//  Shared style helpers (DESIGN.md typography scale)
// ═══════════════════════════════════════════════════════

const s = {
  eyebrow: { fontSize: 12, fontWeight: '600' as const, color: L.teal, letterSpacing: 2, textTransform: 'uppercase' as const },
  h1: { fontSize: 26, fontWeight: '700' as const, color: L.navy, letterSpacing: -0.5, lineHeight: 32, fontFamily: 'Manrope_700Bold' },
  h2: { fontSize: 19, fontWeight: '600' as const, color: L.navy, letterSpacing: -0.3, lineHeight: 24, fontFamily: 'Manrope_600SemiBold' },
  body: { fontSize: 15, fontWeight: '400' as const, color: L.navySoft, lineHeight: 22, fontFamily: 'Manrope_400Regular' },
  caption: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 1, fontFamily: 'Manrope_600SemiBold' },
  micro: { fontSize: 11, fontWeight: '400' as const, lineHeight: 14, fontFamily: 'Manrope_400Regular' },
  sectionPy16: { paddingVertical: 64, paddingHorizontal: 24 },
  sectionPy10: { paddingVertical: 40, paddingHorizontal: 24 },
};

// ═══════════════════════════════════════════════════════
//  1. HERO
//  min-h ~92% first viewport, centered, auth buttons
// ═══════════════════════════════════════════════════════

type HeroProps = {
  onPressGoogle: () => void;
  onPressEmail?: () => void;
};

export function HeroSection({ onPressGoogle }: HeroProps) {
  return (
    <SectionReveal style={{ minHeight: 680, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 60 }}>
      {/* Logo mark 88×88 */}
      <StaggerItem index={0}>
        <Image
          source={require('../../assets/logo-light.png')}
          style={{ width: 88, height: 88, borderRadius: 20, marginBottom: 16 }}
          resizeMode="contain"
        />
      </StaggerItem>

      {/* Wordmark "PATHFINDER" */}
      <StaggerItem index={1}>
        <Image
          source={require('../../assets/title.png')}
          style={{ width: 220, height: 44, marginBottom: 8 }}
          resizeMode="contain"
        />
      </StaggerItem>

      {/* Tagline — almost H2 size, teal, medium weight */}
      <StaggerItem index={2}>
        <Text style={{ fontSize: 17, fontWeight: '500', color: L.teal, textAlign: 'center', marginBottom: 24, fontFamily: 'Manrope_600SemiBold' }}>
          Every Journey{' '}
          <Text style={{ color: L.terracotta }}>Can Guide Another.</Text>
        </Text>
      </StaggerItem>

      {/* Supporting sentence */}
      <StaggerItem index={3}>
        <Text style={{ fontSize: 14, fontWeight: '400', color: L.navySoft, textAlign: 'center', lineHeight: 22, maxWidth: '85%', marginBottom: 40, fontFamily: 'Manrope_400Regular' }}>
          Learn from real, verified journeys of founders, professionals, and students who have already walked the path you're considering.
        </Text>
      </StaggerItem>

      {/* Auth buttons */}
      <StaggerItem index={4} style={{ width: '100%', maxWidth: 360, gap: 12 }}>
        {/* Primary: Continue with Google */}
        <MotionButton
          onPress={onPressGoogle}
          style={{
            backgroundColor: L.surface, borderWidth: 1, borderColor: L.border,
            height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
            shadowColor: '#152238', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('../../assets/google.png')}
              style={{ width: 20, height: 20, marginRight: 16 }}
              resizeMode="contain"
            />
            <Text style={{ color: L.navy, fontSize: 15, fontWeight: '400', fontFamily: 'Manrope_400Regular' }}>Continue with Google</Text>
          </View>
        </MotionButton>
      </StaggerItem>

      {/* Micro-copy */}
      <StaggerItem index={5}>
        <Text style={{ fontSize: 11, color: 'rgba(21, 34, 56, 0.38)', textAlign: 'center', marginTop: 16, fontFamily: 'Manrope_400Regular' }}>
          By continuing you agree to our Terms & Privacy.
        </Text>
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  2. PROBLEM STATEMENT
//  Left-aligned editorial from here on, short + punchy
// ═══════════════════════════════════════════════════════

export function ProblemSection() {
  return (
    <SectionReveal style={s.sectionPy16}>
      <StaggerItem index={0}><Text style={[s.eyebrow, { marginBottom: 12 }]}>THE PROBLEM</Text></StaggerItem>
      <StaggerItem index={1}><Text style={[s.h1, { marginBottom: 16 }]}>The biggest decisions are often made with the least reliable information.</Text></StaggerItem>
      <StaggerItem index={2}><Text style={s.body}>People jump between LinkedIn, Reddit, YouTube, blogs, and AI assistants for important decisions. Every platform shows a different fragment — achievements, opinions, stories — but never the whole journey.</Text></StaggerItem>
      <StaggerItem index={3}>
        <ProblemDividerDot dotColor={L.teal} lineColor={L.border} style={{ marginTop: 64 }} />
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  3. COMPARISON (Fragmented → Unified)
//  Horizontal scroll of fragment cards → "+" → unified card
// ═══════════════════════════════════════════════════════

const PLATFORMS = [
  { icon: 'share-variant-outline' as const, name: 'LinkedIn', tag: 'Achievements' },
  { icon: 'message-text-outline' as const, name: 'Reddit', tag: 'Opinions' },
  { icon: 'play-circle-outline' as const, name: 'YouTube', tag: 'Stories' },
  { icon: 'creation-outline' as const, name: 'AI', tag: 'General Advice' },
];

const JOURNEY_TAGS = ['Goals', 'Experiences', 'Skills', 'Decision Transitions', 'Outcomes'];

function SwingingPlusBadge() {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
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
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: L.terracottaTint,
          alignItems: 'center',
          justifyContent: 'center',
        },
        animatedStyle,
      ]}
    >
      <Text style={{ fontSize: 22, lineHeight: 28, color: L.terracotta, fontWeight: '500' }}>+</Text>
    </Animated.View>
  );
}

export function ComparisonSection() {
  return (
    <SectionReveal style={s.sectionPy16}>
      <StaggerItem index={0}>
        <Text style={[s.h1, { marginBottom: 24 }]}>
          Every platform shows a piece.{"\n"}PathFinder shows the whole picture.
        </Text>
      </StaggerItem>

      {/* Horizontal scroll of fragment cards */}
      <StaggerItem index={1}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }} contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}>
          {PLATFORMS.map((p, i) => (
            <View key={i} style={{
              width: 128, height: 128, backgroundColor: L.surface, borderRadius: 16,
              borderWidth: 1, borderColor: L.border, alignItems: 'center', justifyContent: 'center', padding: 12,
              shadowColor: '#152238', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: L.tealTint, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <MaterialCommunityIcons name={p.icon} size={22} color={L.teal} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: L.navy, marginBottom: 4, fontFamily: 'Manrope_600SemiBold' }}>{p.name}</Text>
              <View style={{ backgroundColor: L.tealTint, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, color: L.teal, fontWeight: '500' }}>{p.tag}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </StaggerItem>

      {/* Merging "+" badge */}
      <StaggerItem index={2}>
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <SwingingPlusBadge />
        </View>
      </StaggerItem>

      {/* Unified "Verified Journeys" card */}
      <StaggerItem index={3}>
        <View style={{ backgroundColor: L.teal, borderRadius: 24, padding: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#FFFFFF" />
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginLeft: 10, fontFamily: 'Manrope_700Bold' }}>Verified Journeys</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {JOURNEY_TAGS.map((tag, i) => (
              <View key={i} style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '400', fontFamily: 'Manrope_400Regular' }}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 22, marginBottom: 18 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Manrope_600SemiBold' }}>
              THE FULL NARRATIVE
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
//  White card feel, vertical timeline, teal/terracotta/sand dots
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
    <SectionReveal style={s.sectionPy16}>
      <View style={{ backgroundColor: L.surface, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 40, shadowColor: '#152238', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 }}>
        <StaggerItem index={0}>
          <Text style={[s.h1, { marginBottom: 40 }]}>
            Success isn't a moment.{"\n"}It's a sequence of decisions.
          </Text>
        </StaggerItem>

        <StaggerItem index={1}>
          <View style={{ position: 'relative', paddingLeft: 28 }}>
            {/* Timeline rail */}
            <View style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 2, backgroundColor: L.teal, opacity: 0.2 }} />

            {TIMELINE.map((node, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: i < TIMELINE.length - 1 ? 28 : 0, gap: 20 }}>
                <View style={{ marginLeft: -28, alignItems: 'center', width: 12, position: 'relative', zIndex: 10 }}>
                  {node.isFlag ? (
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginLeft: -9, marginTop: -6, shadowColor: '#152238', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
                      <MaterialCommunityIcons name="flag-variant" size={16} color={L.terracotta} />
                    </View>
                  ) : (
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: node.color, borderWidth: 4, borderColor: L.surface }} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: L.navy, fontFamily: 'Manrope_600SemiBold' }}>{node.label}</Text>
                  <Text style={{ fontSize: 13, fontStyle: 'italic', color: L.navySoft, marginTop: 4, marginLeft: 4, fontFamily: 'Manrope_400Regular' }}>{node.caption}</Text>
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
//  Single-column question cards with chevron affordance
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
    <SectionReveal style={s.sectionPy16}>
      <StaggerItem index={0}><Text style={[s.h1, { marginBottom: 24 }]}>Ask questions that matter.</Text></StaggerItem>
      <StaggerItem index={1} style={{ gap: 12 }}>
        <View style={{ gap: 12 }}>
          {QUESTIONS.map((q, i) => (
            <View key={i} style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: L.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16,
              borderWidth: 1, borderColor: L.border,
            }}>
              <Text style={{ fontSize: 14, color: L.navy, flex: 1, paddingRight: 12, fontFamily: 'Manrope_400Regular' }}>{q}</Text>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: L.tealTint, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="chevron-right" size={16} color={L.teal} />
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
//  bg tealTint, 3-step horizontal mini-diagram
// ═══════════════════════════════════════════════════════

const STEPS = [
  { icon: 'help-circle' as const, label: 'Ask' },
  { icon: 'trending-up' as const, label: 'Retrieve\njourneys' },
  { icon: 'zap' as const, label: 'See\npatterns' },
] as const;

export function HowItWorksSection() {
  return (
    <SectionReveal style={s.sectionPy16}>
      <StaggerItem index={0}><Text style={[s.eyebrow, { marginBottom: 12 }]}>HOW IT WORKS</Text></StaggerItem>
      <StaggerItem index={1}><Text style={[s.h1, { marginBottom: 16 }]}>Powered by journeys, not assumptions.</Text></StaggerItem>
      <StaggerItem index={2}>
        <Text style={[s.body, { marginBottom: 20 }]}>
          Unlike standard AI that scrapes static data, PathFinder understands the nuance of real-world paths. Every question you ask triggers a search through a massive knowledge graph built from authentic human experiences.
        </Text>
      </StaggerItem>
      <StaggerItem index={3}>
        <Text style={[s.body, { marginBottom: 40 }]}>
          By identifying hidden patterns across thousands of similar milestones, our engine synthesizes a unique narrative strategy tailored to your specific context — turning fragmented data into a unified, actionable insight.
        </Text>
      </StaggerItem>

      {/* 3-step diagram */}
      <StaggerItem index={4}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }}>
          {(STEPS as unknown as { icon: string; label: string }[]).map((step, i) => (
            <React.Fragment key={i}>
              <View style={{ alignItems: 'center', width: 92 }}>
                <View style={{
                  width: 52, height: 52, borderRadius: 26,
                  backgroundColor: L.teal,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                }}>
                  <Feather name={step.icon as any} size={22} color="#FFFFFF" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '500', color: L.navy, textAlign: 'center', fontFamily: 'Manrope_600SemiBold' }}>{step.label}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={{ flex: 1, alignItems: 'center', paddingTop: 26 }}>
                  <View style={{ width: '100%', borderTopWidth: 2, borderTopColor: '#A3B8B5', borderStyle: 'dashed', opacity: 0.9 }} />
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
//  7. VERIFICATION & TRUST
//  Simple section with shield badge
// ═══════════════════════════════════════════════════════

export function VerificationSection() {
  return (
    <SectionReveal style={s.sectionPy16}>
      <StaggerItem index={0}>
        <Text style={[s.h1, { marginBottom: 16 }]}>Trust begins with authenticity.</Text>
      </StaggerItem>
      <StaggerItem index={1}>
        <Text style={[s.body, { marginBottom: 24 }]}>
          People hesitate to share failures or unconventional decisions for fear of judgment, especially on traditional professional networks. PathFinder encourages honest storytelling; verification confirms experiences are genuine — not that someone is "successful."
        </Text>
      </StaggerItem>
      <StaggerItem index={2}>
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: L.tealTint, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="shield" size={28} color={L.teal} />
          </View>
        </View>
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  8. COMMUNITY / COLLECTIVE KNOWLEDGE
//  bg-surface with avatar dots motif
// ═══════════════════════════════════════════════════════

export function CommunitySection() {
  return (
    <SectionReveal style={s.sectionPy16}>
      <StaggerItem index={0}>
        <Text style={[s.h1, { marginBottom: 16 }]}>Collective knowledge, not social networking.</Text>
      </StaggerItem>
      <StaggerItem index={1}>
        <Text style={[s.body, { marginBottom: 32 }]}>
          Every contributed journey helps someone else facing similar uncertainty — one founder's pivot helps another avoid the same mistake, one student's internship prep guides hundreds. As more verified journeys are added, the graph gets richer and recommendations get stronger for everyone.
        </Text>
      </StaggerItem>
      {/* Avatar dots motif — overlapping circles converging */}
      <StaggerItem index={2}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: L.teal, marginRight: -10, borderWidth: 2, borderColor: L.surface, zIndex: 4 }} />
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: L.terracotta, marginRight: -10, borderWidth: 2, borderColor: L.surface, zIndex: 3 }} />
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: L.sand, marginRight: -10, borderWidth: 2, borderColor: L.surface, zIndex: 2 }} />
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: L.navy, borderWidth: 2, borderColor: L.surface, zIndex: 1 }} />
            {/* Arrow */}
            <View style={{ marginLeft: 12 }}>
              <Feather name="arrow-right" size={20} color={L.teal} />
            </View>
            {/* Larger target circle */}
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: L.tealTint, borderWidth: 2, borderColor: L.teal, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
              <Feather name="git-merge" size={20} color={L.teal} />
            </View>
          </View>
        </View>
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  9. ACCESSIBILITY / VOICE & LANGUAGE
//  Mic ripple badge, language chips, feature cards
// ═══════════════════════════════════════════════════════

const LANG_CHIPS = ['हिन्दी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'मराठी'];

export function AccessibilitySection() {
  return (
    <SectionReveal style={s.sectionPy16}>
      <StaggerItem index={0}>
        <View style={{ alignItems: 'flex-start', marginBottom: 18 }}>
          <RippleMicBadge label="NATURAL INTERACTION" />
        </View>
      </StaggerItem>

      <StaggerItem index={1}><Text style={[s.h1, { marginBottom: 16 }]}>Knowledge, accessible to everyone.</Text></StaggerItem>
      <StaggerItem index={2}>
        <Text style={[s.body, { marginBottom: 24 }]}>
          Users can interact through voice, ask questions naturally, receive insights in multiple Indian languages, and listen instead of read.
        </Text>
      </StaggerItem>

      {/* Language chips */}
      <StaggerItem index={3}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {LANG_CHIPS.map((lang, i) => (
            <View key={i} style={{ backgroundColor: L.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(234, 231, 224, 0.5)', shadowColor: '#152238', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}>
              <Text style={{ fontSize: 13, color: L.teal, fontWeight: '700', fontFamily: 'Manrope_700Bold' }}>{lang}</Text>
            </View>
          ))}
        </View>
      </StaggerItem>

      {/* Feature cards */}
      <StaggerItem index={4}>
        <View style={{ gap: 12 }}>
          <View style={{ backgroundColor: L.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.border, shadowColor: '#152238', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: L.tealTint, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Feather name="globe" size={18} color={L.teal} />
            </View>
            <Text style={[s.h2, { marginBottom: 6 }]}>Native Support</Text>
            <Text style={[s.micro, { color: L.navySoft }]}>Switch between languages instantly with perfect semantic translation.</Text>
          </View>
          <View style={{ backgroundColor: L.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.border, shadowColor: '#152238', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: L.terracottaTint, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Feather name="volume-2" size={18} color={L.terracotta} />
            </View>
            <Text style={[s.h2, { marginBottom: 6 }]}>Read Aloud</Text>
            <Text style={[s.micro, { color: L.navySoft }]}>Hear your milestones narrated with human-like, empathetic voice synthesis.</Text>
          </View>
        </View>
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  10. CLOSING VISION
//  bg-navy (dark invert), centered, emotional
// ═══════════════════════════════════════════════════════

export function ClosingVisionSection() {
  return (
    <SectionReveal style={{ paddingVertical: 80, paddingHorizontal: 24, alignItems: 'stretch' }}>
      <StaggerItem index={0}>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', alignSelf: 'flex-start', marginBottom: 56, fontFamily: 'Manrope_600SemiBold' }}>OUR VISION</Text>
      </StaggerItem>

      {/* Decorative line + dot */}
      <StaggerItem index={1}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: L.terracotta, marginTop: 6 }} />
        </View>
      </StaggerItem>

      <StaggerItem index={2}>
        <Text style={{ fontSize: 24, fontWeight: '400', color: '#FFFFFF', textAlign: 'center', lineHeight: 34, marginBottom: 24, maxWidth: '90%', alignSelf: 'center', fontFamily: 'Manrope_400Regular' }}>
          Imagine if every important decision someone made could help another person make theirs.
        </Text>
      </StaggerItem>
      <StaggerItem index={3}>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', textAlign: 'center', lineHeight: 22, maxWidth: '90%', alignSelf: 'center', fontFamily: 'Manrope_400Regular' }}>
          PathFinder is building a living repository of verified human journeys — not to tell people what they should do, but to help them understand what others did, why, and what they learned. The more journeys the community contributes, the more valuable it becomes for everyone.
        </Text>
      </StaggerItem>

      {/* Decorative flag */}
      <StaggerItem index={4}>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <MaterialCommunityIcons name="flag-variant" size={24} color={L.terracotta} />
        </View>
      </StaggerItem>
    </SectionReveal>
  );
}

// ═══════════════════════════════════════════════════════
//  11. FOOTER
//  bg-navy (continuous with closing), small logo + links
// ═══════════════════════════════════════════════════════

export function FooterSection() {
  return (
    <SectionReveal style={{ paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center' }}>
      {/* Small logo mark */}
      <StaggerItem index={0}>
        <Image
          source={require('../../assets/logo-dark.png')}
          style={{ width: 48, height: 48, borderRadius: 10, marginBottom: 8, opacity: 0.9 }}
          resizeMode="contain"
        />
      </StaggerItem>

      {/* Wordmark */}
      <StaggerItem index={1}>
        <Image
          source={require("../../assets/title-dark.png")}
          style={{ width: 200, height: 32, marginBottom: 8 }}
          resizeMode="contain"
        />
      </StaggerItem>

      {/* Mission line */}
      <StaggerItem index={2}>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', textAlign: 'center', marginBottom: 24, fontFamily: 'Manrope_400Regular' }}>
          Building collective wisdom through verified journeys.
        </Text>
      </StaggerItem>

      {/* Nav links */}
      <StaggerItem index={3}>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['PRIVACY', 'TERMS', 'GITHUB', 'CONTACT'].map((link, i) => (
            <Text key={i} style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.50)', letterSpacing: 1, fontFamily: 'Manrope_600SemiBold' }}>
              {link}
            </Text>
          ))}
        </View>
      </StaggerItem>

      {/* Tech line */}
      <StaggerItem index={4}>
        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 8, fontFamily: 'Manrope_400Regular' }}>
          Powered by Expo, Neo4j, GraphRAG, Gemini, Groq and Sarvam AI.
        </Text>
      </StaggerItem>
    </SectionReveal>
  );
}
