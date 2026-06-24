import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, Animated, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DecisionAtlasBackendResponse, UserTrajectory, TimelineEvent } from '@/types/schema';
import { getEmotionStyle, NODE_ICONS } from '@/constants/colors';
import { extractKeyMilestones } from '@/utils/helpers';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = SCREEN_W - 64;

/* ── Mock Payload ──────────────────────────────────────── */

const MOCK: DecisionAtlasBackendResponse = {
  structuredQuery: {
    queryType: 'exploration', topics: ['Startup'], subtopics: ['Fintech'],
    skills: [], focus: 'career path',
    semanticQuery: "I'm a CS grad, want to build a fintech startup, should I work first or start directly?",
  },
  aggregatedContext: {
    journeyStatistics: {
      usersAnalyzed: 18, experiencesAnalyzed: 72,
      pathSplit: { workedFirst: 11, startedDirectly: 7 },
      averageTimeToRevenue: 2.1,
    },
    commonPatterns: [
      { title: 'Career Path', description: 'Worked in industry before founding', frequency: 11, percentage: 61 },
      { title: 'Direct Start', description: 'Started building immediately after education', frequency: 7, percentage: 39 },
    ],
    aiInsights: {
      directAnswer: 'Most people who worked first said 2 years of industry experience made fundraising significantly easier.',
      keyPoints: [
        'Those who started directly took ~1.5 years longer on average to reach first revenue.',
        'Having strong domain knowledge (finance + tech) was a common advantage across both paths.',
        'Network and mentors played a key role in early traction for both groups.',
        'Confidence and clarity of problem > the path taken.',
      ],
      actionableTakeaway: 'Work first for 2 years, build domain expertise, then start.',
    },
    timelineFeed: [
      {
        username: 'fintech-founder-01', reputationScore: 94,
        timeline: [
          { id: 'ff1-1', title: 'SDE at SaaS startup', startDate: '2019', endDate: '2021', organization: 'SaaS Corp', isVerified: true, nodeType: 'Job', emotionLabel: 'Confident', timelineSummary: 'Software Engineer at a SaaS product company.', expandedDetails: { context: 'Joined early-stage SaaS startup as employee #12.', challengeFaced: 'Wearing many hats in a resource-constrained team.', outcome: 'Built full-stack skills and understood B2B sales cycles.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Full-Stack', 'B2B SaaS'], transitions: [{ decisionLabel: 'Worked for 2 years to learn industry', toExperienceId: 'ff1-2' }] } },
          { id: 'ff1-2', title: 'Worked for 2 yrs to learn industry', startDate: '2021', endDate: '2021', organization: '', isVerified: false, nodeType: 'Decision', emotionLabel: 'Uncertain', timelineSummary: 'Worked for 2 years to understand the industry and build network before starting.', expandedDetails: { context: 'Felt I lacked real-world experience in payments and lending. Wanted to understand how fintech products work, how teams operate, and build my network.', challengeFaced: 'Uncertainty about timing — was I wasting time?', outcome: 'Built deep domain knowledge and professional network.', achievements: null, applicationStatus: null, emotionNote: "'I was unsure if I was wasting time by not starting early, but deep down I knew this would make me stronger in the long run.'", goals: [], skills: ['Domain Knowledge', 'Networking'], transitions: [{ decisionLabel: 'Left job to build fintech product', toExperienceId: 'ff1-3' }] } },
          { id: 'ff1-3', title: 'Left job to build fintech product', startDate: '2022', endDate: '2022', organization: '', isVerified: false, nodeType: 'Decision', emotionLabel: 'Pivoting', timelineSummary: 'Left job to build fintech product', expandedDetails: { context: 'Had enough domain knowledge and savings to take the leap.', challengeFaced: 'Leaving a stable income.', outcome: 'Started building the fintech product full-time.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Risk-taking'], transitions: [{ decisionLabel: 'First revenue $150K ARR', toExperienceId: 'ff1-4' }] } },
          { id: 'ff1-4', title: 'First revenue $150K ARR', startDate: '2024', endDate: '2024', organization: 'FinServe', isVerified: true, nodeType: 'Startup', emotionLabel: 'Confident', timelineSummary: 'Building a fintech startup, reached $150K ARR.', expandedDetails: { context: 'Product-market fit achieved.', challengeFaced: 'Scaling the team.', outcome: 'Reached $150K ARR with strong retention.', achievements: '$150K ARR\n10 enterprise customers', applicationStatus: null, emotionNote: null, goals: [], skills: ['Fundraising', 'Leadership'], transitions: [] } },
        ],
      },
      {
        username: 'direct-starter-05', reputationScore: 82,
        timeline: [
          { id: 'ds5-1', title: 'B.Tech Computer Science', startDate: '2016', endDate: '2020', organization: 'IIT Madras', isVerified: true, nodeType: 'Education', emotionLabel: 'Confident', timelineSummary: 'Studied CS, focused on ML and fintech projects.', expandedDetails: { context: 'Undergraduate education.', challengeFaced: 'Academic pressure.', outcome: 'Strong CS fundamentals.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['ML', 'Python'], transitions: [{ decisionLabel: 'Started building immediately', toExperienceId: 'ds5-2' }] } },
          { id: 'ds5-2', title: 'Started lending platform', startDate: '2020', endDate: '2021', organization: 'Self', isVerified: false, nodeType: 'Startup', emotionLabel: 'Pivoting', timelineSummary: 'Built peer-to-peer lending platform from scratch.', expandedDetails: { context: 'Direct start after graduation.', challengeFaced: 'No industry network or domain expertise.', outcome: 'Learned fast but struggled with compliance.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Fintech', 'Compliance'], transitions: [{ decisionLabel: 'Pivoted after regulatory issues', toExperienceId: 'ds5-3' }] } },
          { id: 'ds5-3', title: 'Pivoted to payments infra', startDate: '2022', endDate: 'Present', organization: 'PayBridge', isVerified: true, nodeType: 'Achievement', emotionLabel: 'Confident', timelineSummary: 'Pivoted to B2B payments infrastructure, growing steadily.', expandedDetails: { context: 'Applied lending learnings to payments.', challengeFaced: 'Rebuilding from scratch.', outcome: 'Reached $80K ARR.', achievements: '$80K ARR\nYC Interview', applicationStatus: null, emotionNote: null, goals: [], skills: ['Payments', 'B2B Sales'], transitions: [] } },
        ],
      },
    ],
  },
};

const AI_INSIGHTS_ICONS = ['📊', '💡', '⭐', '👥', '📈'];

/* ── Skeleton ──────────────────────────────────────────── */

function Shimmer({ w, h, r = 8 }: { w: number | string; h: number; r?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ])).start();
  }, [anim]);
  return <Animated.View style={{ width: w as any, height: h, borderRadius: r, backgroundColor: '#E2E8F0', opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] }) }} />;
}

function LoadingSkeleton() {
  return (
    <View style={s.container}>
      <View style={{ padding: 20, gap: 16 }}>
        <Shimmer w="40%" h={14} />
        <Shimmer w="90%" h={24} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          {[1, 2, 3].map(i => <Shimmer key={i} w={110} h={80} r={12} />)}
        </View>
        <Shimmer w="50%" h={18} />
        <Shimmer w="100%" h={280} r={16} />
        <Shimmer w="100%" h={160} r={16} />
      </View>
    </View>
  );
}

/* ── Main ──────────────────────────────────────────────── */

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [aiOn, setAiOn] = useState(true);

  const { structuredQuery, aggregatedContext } = MOCK;
  const { journeyStatistics: stats, aiInsights, timelineFeed } = aggregatedContext;

  useEffect(() => { setTimeout(() => setLoading(false), 1600); }, []);
  if (loading) return <LoadingSkeleton />;

  const onScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
    setCurrentIdx(idx);
  };

  const renderJourneyCard = ({ item, index }: { item: UserTrajectory; index: number }) => {
    const milestones = extractKeyMilestones(item.timeline);
    const first = item.timeline[0];
    const last = item.timeline[item.timeline.length - 1];
    const decisionNode = item.timeline.find(e => e.nodeType === 'Decision');
    const emotionStyle = getEmotionStyle(last?.emotionLabel || 'Confident');

    return (
      <View style={[s.card, { width: CARD_W }]}>
        {/* Mini horizontal timeline */}
        <View style={s.miniTimeline}>
          {milestones.map((m, i) => {
            const nodeColor = m.nodeType === 'Decision' ? '#F59E0B' : m.nodeType === 'Failure' ? '#EF4444' : '#6366F1';
            return (
              <React.Fragment key={m.id}>
                {i > 0 && <View style={[s.miniLine, { backgroundColor: nodeColor }]} />}
                <View style={s.miniNode}>
                  <View style={[s.miniDot, { backgroundColor: nodeColor }]}>
                    <Text style={s.miniIcon}>{NODE_ICONS[m.nodeType] || '●'}</Text>
                  </View>
                  <Text style={[s.miniYear, { color: nodeColor }]}>{m.startDate}</Text>
                  <Text style={s.miniLabel} numberOfLines={1}>{m.nodeType}</Text>
                  <Text style={s.miniSublabel} numberOfLines={2}>{m.title}</Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* Summary sections */}
        <View style={s.summaryBlock}>
          <View style={s.summaryRow}>
            <Text style={s.summaryIcon}>💼</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.summaryLabel}>Where they started:</Text>
              <Text style={s.summaryText}>{first?.timelineSummary}</Text>
            </View>
          </View>
          {decisionNode && (
            <View style={s.summaryRow}>
              <Text style={s.summaryIcon}>◆</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.summaryLabel}>Key decision:</Text>
                <Text style={s.summaryText}>{decisionNode.timelineSummary}</Text>
              </View>
            </View>
          )}
          <View style={s.summaryRow}>
            <Text style={s.summaryIcon}>🚀</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.summaryLabel}>Where they are now:</Text>
              <Text style={s.summaryText}>{last?.timelineSummary}</Text>
            </View>
          </View>
        </View>

        {/* Bottom bar */}
        <View style={s.cardBottom}>
          <View style={s.pill}><Text style={s.pillText}>Subtopic: Career Path</Text></View>
          <View style={[s.pill, { backgroundColor: emotionStyle.bg }]}>
            <Text style={[s.pillText, { color: emotionStyle.text }]}>Emotion: {last?.emotionLabel}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/full-journey', params: { userData: JSON.stringify(item) } })}
          >
            <Text style={s.seeFullText}>See full journey →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>←</Text></TouchableOpacity>
        <View style={s.aiTogglePill}>
          <Text style={s.aiToggleIcon}>✨</Text>
          <Text style={s.aiToggleLabel}>AI insight</Text>
          <Switch value={aiOn} onValueChange={setAiOn} trackColor={{ false: '#CBD5E1', true: '#6366F1' }} thumbColor="#FFF" style={{ transform: [{ scale: 0.7 }] }} />
        </View>
      </View>

      <Text style={s.queryLabel}>Your question</Text>
      <View style={s.queryRow}>
        <Text style={s.queryText}>{structuredQuery.semanticQuery}</Text>
        <Text style={s.audioIcon}>🔊</Text>
      </View>

      {/* Stat cards */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statIcon}>👥</Text>
          <Text style={s.statNum}>{stats.usersAnalyzed}</Text>
          <Text style={s.statLabel}>journeys{'\n'}matched.</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statIcon}>⚡</Text>
          <Text style={s.statNum}>{stats.pathSplit.workedFirst}, {stats.pathSplit.startedDirectly}</Text>
          <Text style={s.statLabel}>worked first,{'\n'}started directly</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statIcon}>⏱️</Text>
          <Text style={s.statNum}>{stats.averageTimeToRevenue} <Text style={s.statUnit}>yrs</Text></Text>
          <Text style={s.statLabel}>avg time to{'\n'}first revenue</Text>
        </View>
      </View>

      {/* Journey carousel */}
      <View style={s.carouselHeader}>
        <Text style={s.carouselTitle}>Journey {currentIdx + 1} of {timelineFeed.length}</Text>
        <View style={s.carouselArrows}>
          <Text style={s.arrow}>‹</Text>
          <Text style={s.arrow}>›</Text>
        </View>
      </View>

      <FlatList
        data={timelineFeed}
        renderItem={renderJourneyCard}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(_, i) => i.toString()}
        snapToInterval={CARD_W + 16}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 16, paddingRight: 32 }}
      />

      {/* Page dots */}
      <View style={s.dotsRow}>
        {timelineFeed.map((_, i) => (
          <View key={i} style={[s.dot, currentIdx === i && s.dotActive]} />
        ))}
      </View>

      {/* AI Summary */}
      {aiOn && (
        <View style={s.aiCard}>
          <View style={s.aiCardHeader}>
            <Text style={s.aiCardIcon}>✨</Text>
            <Text style={s.aiCardTitle}>AI Summary</Text>
            <View style={{ flex: 1 }} />
            <Text style={s.aiToggleSmLabel}>AI insight</Text>
            <Switch value={aiOn} onValueChange={setAiOn} trackColor={{ false: '#CBD5E1', true: '#6366F1' }} thumbColor="#FFF" style={{ transform: [{ scale: 0.6 }] }} />
          </View>
          {aiInsights.keyPoints.map((point, i) => (
            <View key={i} style={s.aiRow}>
              <Text style={s.aiRowIcon}>{AI_INSIGHTS_ICONS[i] || '•'}</Text>
              <Text style={s.aiRowText}>{point}</Text>
            </View>
          ))}
          <View style={s.aiRow}>
            <Text style={s.aiRowIcon}>{AI_INSIGHTS_ICONS[4]}</Text>
            <Text style={s.aiRowText}>{aiInsights.directAnswer}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  back: { fontSize: 24, color: '#0F172A' },
  aiTogglePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingLeft: 10, paddingRight: 4, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  aiToggleIcon: { fontSize: 14 },
  aiToggleLabel: { fontSize: 12, fontWeight: '600', color: '#334155' },

  queryLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  queryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  queryText: { flex: 1, fontSize: 22, fontWeight: '800', color: '#0F172A', lineHeight: 28 },
  audioIcon: { fontSize: 22, marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  statIcon: { fontSize: 18, marginBottom: 6 },
  statNum: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  statUnit: { fontSize: 16, fontWeight: '600' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 },

  carouselHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  carouselTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  carouselArrows: { flexDirection: 'row', gap: 12 },
  arrow: { fontSize: 22, color: '#94A3B8' },

  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },

  miniTimeline: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 4 },
  miniNode: { alignItems: 'center', width: 70 },
  miniDot: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  miniIcon: { fontSize: 14, color: '#FFF' },
  miniLine: { height: 2, flex: 1, alignSelf: 'center', marginTop: 16, marginHorizontal: -4, opacity: 0.4 },
  miniYear: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  miniLabel: { fontSize: 10, color: '#64748B', textAlign: 'center' },
  miniSublabel: { fontSize: 9, color: '#94A3B8', textAlign: 'center', marginTop: 1 },

  summaryBlock: { gap: 14, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryIcon: { fontSize: 16, marginTop: 2 },
  summaryLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  summaryText: { fontSize: 14, color: '#475569', lineHeight: 20 },

  cardBottom: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  pill: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  pillText: { fontSize: 11, fontWeight: '600', color: '#4338CA' },
  seeFullText: { fontSize: 13, fontWeight: '600', color: '#6366F1' },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
  dotActive: { backgroundColor: '#6366F1', width: 20 },

  aiCard: { backgroundColor: '#F5F3FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#DDD6FE' },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  aiCardIcon: { fontSize: 18 },
  aiCardTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B' },
  aiToggleSmLabel: { fontSize: 11, color: '#6366F1', fontWeight: '600' },
  aiRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  aiRowIcon: { fontSize: 16, marginTop: 1 },
  aiRowText: { flex: 1, fontSize: 14, color: '#334155', lineHeight: 20 },
});
