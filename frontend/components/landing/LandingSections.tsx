import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
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
  section: (bg: string) => ({ paddingVertical: 64, paddingHorizontal: 24, backgroundColor: bg }),
};

// ═══════════════════════════════════════════════════════
//  1. HERO
// ═══════════════════════════════════════════════════════

type HeroProps = {
  onPressGoogle: () => void;
  onPressEmail: () => void;
};

export function HeroSection({ onPressGoogle, onPressEmail }: HeroProps) {
  return (
    <View style={{ minHeight: 680, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 60, backgroundColor: L.background }}>
      {/* Logo */}
      <Image
        source={require('../../assets/logo.jpg')}
        style={{ width: 88, height: 88, borderRadius: 22, marginBottom: 16, opacity: 0.95 }}
        resizeMode="contain"
      />

      {/* Wordmark */}
      <Text style={{ fontSize: 22, fontWeight: '700', color: L.navy, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>
        PATHFINDER
      </Text>

      {/* Tagline */}
      <Text style={{ fontSize: 17, fontWeight: '500', color: L.teal, textAlign: 'center', marginBottom: 24 }}>
        Every Journey Can Guide Another.
      </Text>

      {/* Supporting copy */}
      <Text style={{ fontSize: 14, color: L.navySoft, textAlign: 'center', lineHeight: 22, maxWidth: '85%', marginBottom: 40 }}>
        Learn from real, verified journeys of founders, professionals, and students who have already walked the path you're considering.
      </Text>

      {/* Auth buttons */}
      <View style={{ width: '100%', maxWidth: 360, gap: 12 }}>
        <TouchableOpacity
          onPress={onPressGoogle}
          style={{
            backgroundColor: L.surface, borderWidth: 1, borderColor: L.border,
            height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
            shadowColor: '#152238', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 20,
          }}
        >
          <Text style={{ color: L.navy, fontSize: 15, fontWeight: '600' }}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPressEmail}
          style={{
            backgroundColor: 'transparent', borderWidth: 1, borderColor: '#15223833',
            height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: L.navy, fontSize: 15, fontWeight: '500' }}>Continue with Email</Text>
        </TouchableOpacity>
      </View>

      {/* Micro-copy */}
      <Text style={{ fontSize: 11, color: '#15223860', textAlign: 'center', marginTop: 16 }}>
        By continuing you agree to our Terms & Privacy.
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
//  2. PROBLEM STATEMENT
// ═══════════════════════════════════════════════════════

export function ProblemSection() {
  return (
    <View style={s.section(L.background)}>
      <Text style={[s.eyebrow, { marginBottom: 12 }]}>THE PROBLEM</Text>
      <Text style={[s.h1, { marginBottom: 16 }]}>
        The biggest decisions are often made with the least reliable information.
      </Text>
      <Text style={s.body}>
        People jump between LinkedIn, Reddit, YouTube, blogs, and AI assistants for important decisions. Every platform shows a different fragment — achievements, opinions, stories — but never the whole journey.
      </Text>
      {/* Editorial flourish: divider node */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 48, gap: 16 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: L.teal }} />
        <View style={{ flex: 1, height: 1, backgroundColor: L.border }} />
      </View>
    </View>
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

export function ComparisonSection() {
  return (
    <View style={s.section(L.background)}>
      <Text style={[s.h2, { textAlign: 'center', marginBottom: 24 }]}>
        Every platform shows a piece.{"\n"}PathFinder shows the whole picture.
      </Text>

      {/* Horizontal scroll of fragment cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}>
        {PLATFORMS.map((p, i) => (
          <View key={i} style={{
            width: 120, height: 120, backgroundColor: L.surface, borderRadius: 16,
            borderWidth: 1, borderColor: L.border, alignItems: 'center', justifyContent: 'center', padding: 12,
          }}>
            <Text style={{ fontSize: 28, marginBottom: 8 }}>{p.icon}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: L.navy, marginBottom: 4 }}>{p.name}</Text>
            <View style={{ backgroundColor: L.tealTint, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 11, color: L.teal, fontWeight: '600' }}>{p.tag}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Merge indicator */}
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <Text style={{ fontSize: 28, color: L.terracotta }}>+</Text>
      </View>

      {/* Unified card */}
      <View style={{
        backgroundColor: L.teal, borderRadius: 24, padding: 24,
      }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 }}>✦ Verified Journeys</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {JOURNEY_TAGS.map((tag, i) => (
            <View key={i} style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '500' }}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
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
    <View style={[s.section(L.surface), { borderRadius: 0 }]}>
      <View style={{ backgroundColor: L.surface, borderRadius: 24, padding: 24 }}>
        <Text style={[s.h1, { marginBottom: 32 }]}>
          Success isn't a moment.{"\n"}It's a sequence of decisions.
        </Text>

        {/* Timeline */}
        <View style={{ position: 'relative', paddingLeft: 24 }}>
          {/* Vertical line */}
          <View style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 2, backgroundColor: L.teal, opacity: 0.2 }} />

          {TIMELINE.map((node, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: i < TIMELINE.length - 1 ? 28 : 0, gap: 20 }}>
              {/* Dot or flag */}
              <View style={{ marginLeft: -24, alignItems: 'center', width: 12 }}>
                {node.isFlag ? (
                  <Text style={{ fontSize: 20, marginLeft: -4, marginTop: -2 }}>🚩</Text>
                ) : (
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: node.color, borderWidth: 3, borderColor: L.surface }} />
                )}
              </View>
              {/* Text */}
              <View>
                <Text style={{ fontSize: 15, fontWeight: '600', color: L.navy }}>{node.label}</Text>
                <Text style={{ fontSize: 13, fontStyle: 'italic', color: L.navySoft, marginTop: 4, marginLeft: 4 }}>{node.caption}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
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
    <View style={s.section(L.background)}>
      <Text style={[s.h1, { marginBottom: 24 }]}>Ask questions that matter.</Text>
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
    </View>
  );
}

// ═══════════════════════════════════════════════════════
//  6. HOW IT WORKS (AI)
// ═══════════════════════════════════════════════════════

const STEPS = [
  { icon: '❓', label: 'Ask' },
  { icon: '🗺️', label: 'Retrieve\njourneys' },
  { icon: '✨', label: 'See\npatterns' },
];

export function HowItWorksSection() {
  return (
    <View style={s.section(L.tealTint)}>
      <Text style={[s.eyebrow, { marginBottom: 12 }]}>HOW IT WORKS</Text>
      <Text style={[s.h1, { marginBottom: 16 }]}>
        Powered by journeys, not assumptions.
      </Text>
      <Text style={[s.body, { marginBottom: 32 }]}>
        Unlike standard AI that scrapes static data, PathFinder understands the nuance of real-world paths. Every question you ask triggers a search through a massive knowledge graph built from authentic human experiences.
      </Text>
      <Text style={[s.body, { marginBottom: 40 }]}>
        By identifying hidden patterns across thousands of similar milestones, our engine synthesizes a unique narrative strategy tailored to your specific context — turning fragmented data into a unified, actionable insight.
      </Text>

      {/* 3-step diagram */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {STEPS.map((step, i) => (
          <React.Fragment key={i}>
            <View style={{ alignItems: 'center', width: 80 }}>
              <View style={{
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: i === 2 ? L.teal : L.surface,
                borderWidth: 1, borderColor: L.border,
                alignItems: 'center', justifyContent: 'center', marginBottom: 8,
              }}>
                <Text style={{ fontSize: 20 }}>{step.icon}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '500', color: L.navy, textAlign: 'center' }}>{step.label}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={{ width: 24, height: 1, backgroundColor: L.teal, opacity: 0.3, marginBottom: 24 }} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
//  7. VERIFICATION & TRUST
// ═══════════════════════════════════════════════════════

export function TrustSection() {
  return (
    <View style={s.section(L.background)}>
      <Text style={[s.h1, { marginBottom: 16 }]}>Trust begins with authenticity.</Text>
      <Text style={s.body}>
        People hesitate to share failures or unconventional decisions for fear of judgment, especially on traditional professional networks. PathFinder encourages honest storytelling; verification confirms experiences are genuine — not that someone is "successful."
      </Text>
      {/* Shield icon */}
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <View style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: L.tealTint, alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 28 }}>🛡️</Text>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
//  8. COMMUNITY
// ═══════════════════════════════════════════════════════

export function CommunitySection() {
  return (
    <View style={s.section(L.surface)}>
      <Text style={[s.h1, { marginBottom: 16 }]}>Collective knowledge, not social networking.</Text>
      <Text style={s.body}>
        Every contributed journey helps someone else facing similar uncertainty — one founder's pivot helps another avoid the same mistake, one student's internship prep guides hundreds. As more verified journeys are added, the graph gets richer and recommendations get stronger for everyone.
      </Text>
      {/* Avatar dots visual */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32 }}>
        {[L.teal, L.terracotta, L.sand, L.teal].map((color, i) => (
          <View key={i} style={{
            width: 36, height: 36, borderRadius: 18, backgroundColor: color,
            borderWidth: 3, borderColor: L.surface,
            marginLeft: i > 0 ? -10 : 0,
          }} />
        ))}
        <View style={{ width: 40, height: 2, backgroundColor: L.border, marginHorizontal: 12 }} />
        <View style={{
          width: 48, height: 48, borderRadius: 24, backgroundColor: L.tealTint,
          borderWidth: 2, borderColor: L.teal, alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: L.teal }}>YOU</Text>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
//  9. ACCESSIBILITY
// ═══════════════════════════════════════════════════════

const LANGUAGES = ['हिन्दी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'मराठी'];

export function AccessibilitySection() {
  return (
    <View style={s.section(L.tealTint)}>
      <Text style={[s.h1, { marginBottom: 16 }]}>Knowledge, accessible to everyone.</Text>
      <Text style={[s.body, { marginBottom: 24 }]}>
        Users can interact through voice, ask questions naturally, receive insights in multiple Indian languages, and listen instead of read.
      </Text>

      {/* Language chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
        {LANGUAGES.map((lang, i) => (
          <View key={i} style={{ backgroundColor: L.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#EAE7E080' }}>
            <Text style={{ fontSize: 13, color: L.teal, fontWeight: '700' }}>{lang}</Text>
          </View>
        ))}
      </View>

      {/* Feature cards */}
      <View style={{ gap: 12 }}>
        <View style={{ backgroundColor: L.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.border }}>
          <Text style={{ fontSize: 18, marginBottom: 8 }}>🌐</Text>
          <Text style={[s.h2, { marginBottom: 4 }]}>Native Support</Text>
          <Text style={s.micro}>Switch between languages instantly with perfect semantic translation.</Text>
        </View>
        <View style={{ backgroundColor: L.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.border }}>
          <Text style={{ fontSize: 18, marginBottom: 8 }}>🔊</Text>
          <Text style={[s.h2, { marginBottom: 4 }]}>Read Aloud</Text>
          <Text style={s.micro}>Hear your milestones narrated with human-like, empathetic voice synthesis.</Text>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
//  10. CLOSING VISION
// ═══════════════════════════════════════════════════════

export function ClosingVisionSection() {
  return (
    <View style={[s.section(L.navy), { paddingVertical: 80 }]}>
      <Text style={[s.eyebrow, { color: '#FFFFFF60', textAlign: 'center', marginBottom: 24 }]}>OUR VISION</Text>
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', lineHeight: 34, marginBottom: 20, maxWidth: '90%', alignSelf: 'center' }}>
        Imagine if every important decision someone made could help another person make theirs.
      </Text>
      <Text style={{ fontSize: 14, color: '#FFFFFFB3', textAlign: 'center', lineHeight: 22, maxWidth: '90%', alignSelf: 'center' }}>
        PathFinder is building a living repository of verified human journeys — not to tell people what they should do, but to help them understand what others did, why, and what they learned. The more journeys the community contributes, the more valuable it becomes for everyone.
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
//  11. FOOTER
// ═══════════════════════════════════════════════════════

export function FooterSection() {
  return (
    <View style={{ backgroundColor: L.navy, paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center' }}>
      {/* Logo + wordmark */}
      <Image
        source={require('../../assets/logo.jpg')}
        style={{ width: 24, height: 24, borderRadius: 6, marginBottom: 8, opacity: 0.9 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
        PATHFINDER
      </Text>
      <Text style={{ fontSize: 12, color: '#FFFFFF99', textAlign: 'center', marginBottom: 20 }}>
        Building collective wisdom through verified journeys.
      </Text>

      {/* Links */}
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
        {['Privacy', 'Terms', 'GitHub', 'Contact'].map((link, i) => (
          <Text key={i} style={{ fontSize: 11, fontWeight: '600', color: '#FFFFFF80', textTransform: 'uppercase', letterSpacing: 1 }}>
            {link}
          </Text>
        ))}
      </View>

      {/* Powered by */}
      <Text style={{ fontSize: 10, color: '#FFFFFF59', textAlign: 'center', marginTop: 8 }}>
        Powered by Expo, Neo4j, GraphRAG, OpenAI, and Sarvam AI.
      </Text>
    </View>
  );
}
