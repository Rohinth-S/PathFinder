import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  DecisionAtlasBackendResponse, CommonPattern,
  UserTrajectory, TimelineEvent,
} from '@/types/schema';

const SCREEN_WIDTH = Dimensions.get('window').width;

/* ── Mock Data ─────────────────────────────────────────────── */

const MOCK_PAYLOAD: DecisionAtlasBackendResponse = {
  structuredQuery: {
    queryType: 'exploration',
    topics: ['Startup'],
    subtopics: ['SaaS / Tech'],
    skills: [],
    semanticQuery: 'What products did SaaS founders build before PMF?',
    focus: 'products',
  },
  aggregatedContext: {
    journeyStatistics: { usersAnalyzed: 43, experiencesAnalyzed: 120 },
    commonPatterns: [
      { title: 'Internal Tools', description: 'Automated workflows for internal teams and clients', frequency: 18, percentage: 42 },
      { title: 'Agency Services', description: 'Solved business problems for small companies', frequency: 13, percentage: 31 },
      { title: 'Productivity Apps', description: 'Built simple task and workflow management tools', frequency: 10, percentage: 24 },
      { title: 'Marketplaces', description: 'Created niche two-sided marketplaces', frequency: 8, percentage: 18 },
    ],
    aiInsights: {
      directAnswer: "Most successful SaaS founders didn't start with their final product. They first solved small, real problems and evolved.",
      keyPoints: [
        'Digital assets and presales were used for early financial validation.',
        'Rapid MVPs focused on core data utility or automation were built.',
      ],
      actionableTakeaway: 'Validate market demand by preselling discounted licenses or packaging digital assets before full product development.',
    },
    timelineFeed: [
      {
        username: 'Sridhar Vembu',
        reputationScore: 96,
        timeline: [
          {
            id: 'sv-1', title: 'Built Internal Network Tool',
            startDate: '1996', endDate: '1998', organization: 'AdventNet',
            isVerified: true,
            timelineSummary: 'Automated workflows for internal teams and clients',
            expandedDetails: { context: 'Early internet era networking tools.', challengeFaced: 'Limited market awareness.', outcome: 'Gained deep technical expertise in networking protocols.', achievements: null, applicationStatus: null, goals: [], skills: ['Networking', 'C++'], transitions: [{ decisionLabel: 'Pivoted to service-based revenue', toExperienceId: 'sv-2' }] },
          },
          {
            id: 'sv-2', title: 'Offered Custom Software Services',
            startDate: '1998', endDate: '2001', organization: 'AdventNet',
            isVerified: true,
            timelineSummary: 'Solved business problems for small companies',
            expandedDetails: { context: 'Worked with small businesses to build custom software solutions.', challengeFaced: 'Projects were non-repeatable and hard to scale.', outcome: 'Realized the need for a simple, affordable CRM for small businesses.', achievements: 'Served 25+ small businesses\nBuilt strong domain understanding', applicationStatus: null, goals: [], skills: ['Customer Understanding', 'Problem Solving', 'Sales', 'Product Thinking'], transitions: [{ decisionLabel: 'Decided to build a product that solves their common problems at scale.', toExperienceId: 'sv-3' }] },
          },
          {
            id: 'sv-3', title: 'Launched Zoho CRM (MVP)',
            startDate: '2001', endDate: '2003', organization: 'Zoho Corp',
            isVerified: false,
            timelineSummary: 'Early CRM for small businesses',
            expandedDetails: { context: 'Built first version of what became Zoho CRM.', challengeFaced: 'Competing with Salesforce.', outcome: 'Found niche in affordable SMB CRM.', achievements: null, applicationStatus: null, goals: [], skills: ['Product Strategy', 'Java'], transitions: [{ decisionLabel: 'Expanded product suite', toExperienceId: 'sv-4' }] },
          },
          {
            id: 'sv-4', title: 'Found Product Market Fit',
            startDate: '2003', endDate: '2005', organization: 'Zoho Corp',
            isVerified: true,
            timelineSummary: 'Strong retention & paying customers',
            expandedDetails: { context: 'Rapid growth phase.', challengeFaced: 'Scaling infrastructure and team.', outcome: 'Established Zoho as a major SaaS player.', achievements: null, applicationStatus: null, goals: [], skills: ['Leadership', 'Scaling'], transitions: [] },
          },
        ],
      },
      {
        username: 'audience-builder-97',
        reputationScore: 88,
        timeline: [
          {
            id: 'ab-1', title: 'Associate Software Engineer',
            startDate: '2019', endDate: '2021', organization: 'TCS Innovation Lab',
            isVerified: true,
            timelineSummary: 'Built Spring Boot API wrappers for legacy systems',
            expandedDetails: { context: 'Modernization pipeline for retail banking.', challengeFaced: 'Bureaucratic workflows and slow reviews.', outcome: 'Mastered enterprise data pipeline workflows.', achievements: null, applicationStatus: null, goals: [], skills: ['Enterprise API Design', 'Java'], transitions: [{ decisionLabel: 'Left to build own product', toExperienceId: 'ab-2' }] },
          },
          {
            id: 'ab-2', title: 'Indie SaaS Builder',
            startDate: '2022', endDate: 'Present', organization: 'Self-Employed',
            isVerified: false,
            timelineSummary: 'Launched 3 micro-SaaS products in 6 months',
            expandedDetails: { context: 'Bootstrapping phase.', challengeFaced: 'Finding niche and marketing channels.', outcome: 'Achieved $5k MRR on third product.', achievements: null, applicationStatus: null, goals: [], skills: ['Product Strategy', 'Marketing', 'React'], transitions: [] },
          },
        ],
      },
    ],
  },
};

const COMMON_DECISIONS = [
  { icon: '💼', text: 'Started with services/consulting', percentage: 67 },
  { icon: '🛠️', text: 'Built tools for internal use first', percentage: 58 },
  { icon: '👥', text: 'Validated with real customers early', percentage: 53 },
];

const PRODUCT_ICONS = ['🖥️', '🏢', '⚡', '🛒'];

const TABS = ['Journey', 'Products', 'Decisions', 'Insights'] as const;

/* ── Skeleton Loader ───────────────────────────────────────── */

function SkeletonBlock({ width, height, style }: { width: number | string; height: number; style?: object }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  return <Animated.View style={[{ width: width as any, height, backgroundColor: '#D1D5DB', borderRadius: 8, opacity }, style]} />;
}

function LoadingSkeleton() {
  return (
    <View style={s.container}>
      <View style={{ padding: 20, gap: 16 }}>
        <SkeletonBlock width="90%" height={28} />
        <SkeletonBlock width="50%" height={16} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {[80, 80, 80, 80].map((w, i) => <SkeletonBlock key={i} width={w} height={36} style={{ borderRadius: 18 }} />)}
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          {[1, 2, 3].map(i => <SkeletonBlock key={i} width={100} height={80} style={{ borderRadius: 12 }} />)}
        </View>
        <SkeletonBlock width="60%" height={20} style={{ marginTop: 16 }} />
        {[1, 2, 3].map(i => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 12 }}>
            <SkeletonBlock width={12} height={12} style={{ borderRadius: 6 }} />
            <SkeletonBlock width="85%" height={60} style={{ borderRadius: 12 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── Main Component ────────────────────────────────────────── */

export default function ResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Journey');
  const [isTranslated, setIsTranslated] = useState(false);

  const { structuredQuery, aggregatedContext } = MOCK_PAYLOAD;
  const { journeyStatistics, aiInsights, commonPatterns, timelineFeed } = aggregatedContext;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingSkeleton />;

  const handleEventPress = (event: TimelineEvent) => {
    router.push({
      pathname: '/journey-details',
      params: { eventData: JSON.stringify(event) },
    });
  };

  const renderTimelineStep = (event: TimelineEvent, idx: number, total: number) => {
    const duration = event.endDate === event.startDate
      ? event.startDate
      : `${event.startDate} – ${event.endDate}`;
    const isLast = idx === total - 1;

    return (
      <TouchableOpacity key={event.id} style={s.stepRow} onPress={() => handleEventPress(event)} activeOpacity={0.7}>
        {/* Left vertical line + dot */}
        <View style={s.stepLineCol}>
          <View style={[s.stepDot, event.isVerified && s.stepDotVerified]} />
          {!isLast && <View style={s.stepLine} />}
        </View>
        {/* Right card */}
        <View style={s.stepCard}>
          <View style={s.stepCardHeader}>
            <Text style={s.stepIcon}>
              {idx === 0 ? '🖥️' : idx === 1 ? '💼' : idx === 2 ? '🚀' : '⭐'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={s.stepTitle}>{event.title}</Text>
              <Text style={s.stepMeta}>{duration}  •  {calculateDuration(event.startDate, event.endDate)}</Text>
            </View>
            {event.isVerified && (
              <View style={s.verifiedBadgeSm}>
                <Text style={s.verifiedTextSm}>✓</Text>
              </View>
            )}
            <Text style={s.chevron}>ˇ</Text>
          </View>
          <Text style={s.stepSummary} numberOfLines={2}>{event.timelineSummary}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUserPage = ({ item }: { item: UserTrajectory }) => (
    <View style={{ width: SCREEN_WIDTH - 40 }}>
      <View style={s.userPageHeader}>
        <Text style={s.timelineTitle}>Journey Timeline ({item.username})</Text>
        <View style={s.repBadge}>
          <Text style={s.repIcon}>{item.reputationScore >= 80 ? '⭐' : '🔹'}</Text>
          <Text style={s.repScore}>{item.reputationScore}</Text>
        </View>
      </View>
      {item.timeline.map((ev, idx) => renderTimelineStep(ev, idx, item.timeline.length))}
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* ── Header ──────────────────────────────────────── */}
      <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
        <Text style={s.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={s.headerQuery}>{structuredQuery.semanticQuery}</Text>
      <Text style={s.headerSub}>Analyzed {journeyStatistics.usersAnalyzed} Founders</Text>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow} contentContainerStyle={{ gap: 8 }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tabPill, activeTab === tab && s.tabPillActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Top Pre-PMF Products (Horizontal Scroll) ───── */}
      <View style={s.sectionCard}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionIcon}>✨</Text>
          <Text style={s.sectionLabel}>Top Pre-PMF Products</Text>
          <Text style={s.sectionHeaderRight}>📊</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
          {commonPatterns.map((p: CommonPattern, i) => (
            <View key={i} style={s.productCard}>
              <Text style={s.productIcon}>{PRODUCT_ICONS[i] || '📦'}</Text>
              <Text style={s.productTitle}>{p.title}</Text>
              <Text style={s.productPct}>{p.percentage}%</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── Journey Timeline Carousel ────────────────────── */}
      <FlatList
        data={timelineFeed}
        renderItem={renderUserPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        style={{ marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        snapToInterval={SCREEN_WIDTH - 40}
        decelerationRate="fast"
        scrollEnabled={timelineFeed.length > 1}
      />

      {/* ── Common Decisions ─────────────────────────────── */}
      <View style={s.sectionCard}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>Common Decisions</Text>
          <Text style={s.sectionHeaderRight}>Top 3</Text>
        </View>
        {COMMON_DECISIONS.map((d, i) => (
          <View key={i} style={s.decisionRow}>
            <Text style={s.decisionIcon}>{d.icon}</Text>
            <Text style={s.decisionText}>{d.text}</Text>
            <Text style={s.decisionPct}>{d.percentage}%</Text>
          </View>
        ))}
      </View>

      {/* ── AI Insight Card ──────────────────────────────── */}
      <View style={s.aiCard}>
        <View style={s.aiHeader}>
          <Text style={s.aiIcon}>🧠</Text>
          <Text style={s.aiTitle}>AI Insight</Text>
          <TouchableOpacity
            style={s.translateBtn}
            onPress={() => setIsTranslated(!isTranslated)}
          >
            <Text style={s.translateBtnText}>
              {isTranslated ? '🌐 Original' : '🌐 Translate'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={s.aiBody}>
          {isTranslated ? `Traducido: ${aiInsights.directAnswer}` : aiInsights.directAnswer}
        </Text>
        <Text style={s.aiBrainEmoji}>🧠</Text>
      </View>

    </ScrollView>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */

function calculateDuration(start: string, end: string): string {
  const s = parseInt(start, 10);
  const e = end === 'Present' ? new Date().getFullYear() : parseInt(end, 10);
  if (isNaN(s) || isNaN(e)) return '';
  const diff = e - s;
  return diff <= 1 ? `${diff} yr` : `${diff} yrs`;
}

/* ── Styles ──────────────────────────────────────────────── */

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40, gap: 20 },
  backBtn: { marginBottom: 4 },
  backArrow: { fontSize: 22, color: '#1E293B' },
  headerQuery: { fontSize: 26, fontWeight: '800', color: '#0F172A', lineHeight: 32 },
  headerSub: { fontSize: 14, color: '#6366F1', fontWeight: '600' },

  /* Tabs */
  tabRow: { flexGrow: 0, marginVertical: 4 },
  tabPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  tabPillActive: { backgroundColor: '#6366F1' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },

  /* Product Cards */
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  sectionIcon: { fontSize: 16 },
  sectionLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0F172A' },
  sectionHeaderRight: { fontSize: 14, color: '#94A3B8' },
  productCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, alignItems: 'center', width: 100, borderWidth: 1, borderColor: '#E2E8F0' },
  productIcon: { fontSize: 28, marginBottom: 6 },
  productTitle: { fontSize: 12, fontWeight: '600', color: '#334155', textAlign: 'center', marginBottom: 4 },
  productPct: { fontSize: 16, fontWeight: '800', color: '#6366F1' },

  /* Timeline */
  userPageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  timelineTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  repBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  repIcon: { fontSize: 12 },
  repScore: { fontSize: 12, fontWeight: '700', color: '#92400E' },

  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLineCol: { width: 24, alignItems: 'center' },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#CBD5E1', marginTop: 18, zIndex: 1 },
  stepDotVerified: { backgroundColor: '#10B981' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginTop: -2 },

  stepCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginLeft: 10, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  stepCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  stepIcon: { fontSize: 20 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  stepMeta: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  verifiedBadgeSm: { backgroundColor: '#D1FAE5', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  verifiedTextSm: { color: '#059669', fontSize: 10, fontWeight: '700' },
  chevron: { fontSize: 18, color: '#94A3B8', marginLeft: 4 },
  stepSummary: { fontSize: 14, color: '#64748B', lineHeight: 20 },

  /* Common Decisions */
  decisionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10 },
  decisionIcon: { fontSize: 18 },
  decisionText: { flex: 1, fontSize: 14, color: '#334155' },
  decisionPct: { fontSize: 15, fontWeight: '700', color: '#0F172A' },

  /* AI Insight */
  aiCard: { backgroundColor: '#EEF2FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C7D2FE', position: 'relative', overflow: 'hidden' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiIcon: { fontSize: 20 },
  aiTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#3730A3' },
  translateBtn: { backgroundColor: '#C7D2FE', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  translateBtnText: { fontSize: 11, fontWeight: '600', color: '#4338CA' },
  aiBody: { fontSize: 15, color: '#1E1B4B', lineHeight: 22 },
  aiBrainEmoji: { position: 'absolute', bottom: -8, right: -4, fontSize: 60, opacity: 0.12 },
});
