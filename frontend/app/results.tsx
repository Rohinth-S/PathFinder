import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, Animated, Switch, Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { DecisionAtlasBackendResponse, UserTrajectory, TimelineEvent, AiInsights } from '@/types/schema';
import { getEmotionStyle, NODE_ICONS } from '@/constants/colors';
import { extractKeyMilestones } from '@/utils/helpers';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = SCREEN_W - 64;
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

/* ── Mock Fallback ─────────────────────────────────── */

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
          { id: 'ff1-2', title: 'Worked for 2 yrs to learn industry', startDate: '2021', endDate: '2021', organization: '', isVerified: false, nodeType: 'Decision', emotionLabel: 'Uncertain', timelineSummary: 'Worked for 2 years to understand the industry and build network before starting.', expandedDetails: { context: 'Felt I lacked real-world experience in payments and lending.', challengeFaced: 'Uncertainty about timing.', outcome: 'Built deep domain knowledge and professional network.', achievements: null, applicationStatus: null, emotionNote: "'I was unsure if I was wasting time by not starting early, but deep down I knew this would make me stronger in the long run.'", goals: [], skills: ['Domain Knowledge', 'Networking'], transitions: [{ decisionLabel: 'Left job to build fintech product', toExperienceId: 'ff1-3' }] } },
          { id: 'ff1-3', title: 'Left job to build fintech product', startDate: '2022', endDate: '2022', organization: '', isVerified: false, nodeType: 'Decision', emotionLabel: 'Pivoting', timelineSummary: 'Left job to build fintech product', expandedDetails: { context: 'Had enough domain knowledge and savings.', challengeFaced: 'Leaving stability.', outcome: 'Started building full-time.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Risk-taking'], transitions: [{ decisionLabel: 'First revenue', toExperienceId: 'ff1-4' }] } },
          { id: 'ff1-4', title: 'First revenue $150K ARR', startDate: '2024', endDate: '2024', organization: 'FinServe', isVerified: true, nodeType: 'Startup', emotionLabel: 'Confident', timelineSummary: 'Building a fintech startup, reached $150K ARR.', expandedDetails: { context: 'Product-market fit achieved.', challengeFaced: 'Scaling the team.', outcome: 'Reached $150K ARR with strong retention.', achievements: '$150K ARR\n10 enterprise customers', applicationStatus: null, emotionNote: null, goals: [], skills: ['Fundraising', 'Leadership'], transitions: [] } },
        ],
      },
      {
        username: 'direct-starter-05', reputationScore: 82,
        timeline: [
          { id: 'ds5-1', title: 'B.Tech Computer Science', startDate: '2016', endDate: '2020', organization: 'IIT Madras', isVerified: true, nodeType: 'Education', emotionLabel: 'Confident', timelineSummary: 'Studied CS, focused on ML and fintech projects.', expandedDetails: { context: 'Undergraduate education.', challengeFaced: 'Academic pressure.', outcome: 'Strong CS fundamentals.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['ML', 'Python'], transitions: [{ decisionLabel: 'Started building immediately', toExperienceId: 'ds5-2' }] } },
          { id: 'ds5-2', title: 'Started lending platform', startDate: '2020', endDate: '2021', organization: 'Self', isVerified: false, nodeType: 'Startup', emotionLabel: 'Pivoting', timelineSummary: 'Built peer-to-peer lending platform from scratch.', expandedDetails: { context: 'Direct start after graduation.', challengeFaced: 'No industry network.', outcome: 'Learned fast but struggled with compliance.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Fintech', 'Compliance'], transitions: [{ decisionLabel: 'Pivoted', toExperienceId: 'ds5-3' }] } },
          { id: 'ds5-3', title: 'Pivoted to payments infra', startDate: '2022', endDate: 'Present', organization: 'PayBridge', isVerified: true, nodeType: 'Achievement', emotionLabel: 'Confident', timelineSummary: 'Pivoted to B2B payments infrastructure, growing steadily.', expandedDetails: { context: 'Applied lending learnings to payments.', challengeFaced: 'Rebuilding from scratch.', outcome: 'Reached $80K ARR.', achievements: '$80K ARR\nYC Interview', applicationStatus: null, emotionNote: null, goals: [], skills: ['Payments', 'B2B Sales'], transitions: [] } },
        ],
      },
    ],
  },
};

const AI_ICONS = ['📊', '💡', '⭐', '👥', '📈'];

/* ── Skeleton ──────────────────────────────────────── */

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

/* ── Main ──────────────────────────────────────────── */

export default function ResultsPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payload?: string }>();
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [aiOn, setAiOn] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [translatedInsights, setTranslatedInsights] = useState<AiInsights | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Parse live data from query screen, or fall back to mock
  let data: DecisionAtlasBackendResponse;
  try {
    data = params.payload ? JSON.parse(params.payload) : MOCK;
  } catch {
    data = MOCK;
  }

  const queryText = data.structuredQuery?.semanticQuery || data.structuredQuery?.queryType || '';
  const { journeyStatistics: stats, aiInsights: originalInsights, timelineFeed, commonPatterns } = data.aggregatedContext;
  const aiInsights = translatedInsights || originalInsights;

  useEffect(() => { setTimeout(() => setLoading(false), 1600); }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  if (loading) return <LoadingSkeleton />;

  const onScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
    setCurrentIdx(idx);
  };

  /* ── Translation handler ───────────────────────── */

  async function handleTranslateToggle(val: boolean) {
    setAiOn(val);
    if (!val) {
      setTranslatedInsights(null);
      return;
    }

    // Only translate if we haven't already
    if (translatedInsights) return;

    setIsTranslating(true);
    try {
      const response = await fetch(`${API_BASE}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiInsights: originalInsights,
          language: 'hi-IN', // TODO: pull from user's preferred language in profile
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setTranslatedInsights(result.translatedAiInsights);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  }

  /* ── Speech playback handler ───────────────────── */

  async function handlePlaySummary() {
    if (isPlaying) {
      await soundRef.current?.stopAsync();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      const response = await fetch(`${API_BASE}/speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiInsights: aiInsights,
          language: 'hi-IN', // TODO: pull from user's preferred language
        }),
      });

      if (!response.ok) throw new Error('Speech generation failed');

      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const fileUri = FileSystem.documentDirectory + 'summary.wav';

          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
          const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
          soundRef.current = sound;

          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          });

          await sound.playAsync();
        } catch (e) {
          console.error('Audio save/play error:', e);
          setIsPlaying(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Speech error:', err);
      Alert.alert('Playback Error', 'Could not generate audio summary.');
      setIsPlaying(false);
    }
  }

  /* ── Journey Card Renderer ─────────────────────── */

  const renderJourneyCard = ({ item }: { item: UserTrajectory }) => {
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
            const c = m.nodeType === 'Decision' ? '#F59E0B' : m.nodeType === 'Failure' ? '#EF4444' : '#6366F1';
            return (
              <React.Fragment key={m.id}>
                {i > 0 && <View style={[s.miniLine, { backgroundColor: c }]} />}
                <View style={s.miniNode}>
                  <View style={[s.miniDot, { backgroundColor: c }]}>
                    <Text style={s.miniIcon}>{NODE_ICONS[m.nodeType] || '●'}</Text>
                  </View>
                  <Text style={[s.miniYear, { color: c }]}>{m.startDate}</Text>
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

  /* ── Render ────────────────────────────────────── */

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>←</Text></TouchableOpacity>
        <View style={s.aiTogglePill}>
          <Text style={s.aiToggleIcon}>✨</Text>
          <Text style={s.aiToggleLabel}>AI insight</Text>
          <Switch value={aiOn} onValueChange={handleTranslateToggle} trackColor={{ false: '#CBD5E1', true: '#6366F1' }} thumbColor="#FFF" style={{ transform: [{ scale: 0.7 }] }} />
        </View>
      </View>

      <Text style={s.queryLabel}>Your question</Text>
      <View style={s.queryRow}>
        <Text style={s.queryText}>{queryText || data.structuredQuery?.semanticQuery}</Text>
        <TouchableOpacity onPress={handlePlaySummary}>
          <Text style={s.audioIcon}>{isPlaying ? '⏸️' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      {/* Stat cards */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statIcon}>👥</Text>
          <Text style={s.statNum}>{stats?.usersAnalyzed || 0}</Text>
          <Text style={s.statLabel}>journeys{'\n'}matched.</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statIcon}>⚡</Text>
          <Text style={s.statNum}>{stats?.pathSplit?.workedFirst || 0}, {stats?.pathSplit?.startedDirectly || 0}</Text>
          <Text style={s.statLabel}>worked first,{'\n'}started directly</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statIcon}>⏱️</Text>
          <Text style={s.statNum}>{stats?.averageTimeToRevenue || '–'} <Text style={s.statUnit}>yrs</Text></Text>
          <Text style={s.statLabel}>avg time to{'\n'}first revenue</Text>
        </View>
      </View>

      {/* Journey carousel */}
      <View style={s.carouselHeader}>
        <Text style={s.carouselTitle}>Journey {currentIdx + 1} of {timelineFeed?.length || 0}</Text>
        <View style={s.carouselArrows}>
          <Text style={s.arrow}>‹</Text>
          <Text style={s.arrow}>›</Text>
        </View>
      </View>

      {timelineFeed?.length > 0 ? (
        <>
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
          <View style={s.dotsRow}>
            {timelineFeed.map((_, i) => (
              <View key={i} style={[s.dot, currentIdx === i && s.dotActive]} />
            ))}
          </View>
        </>
      ) : (
        <View style={s.emptyCard}><Text style={s.emptyText}>No journeys found. Try a different query.</Text></View>
      )}

      {/* AI Summary */}
      {aiOn && (
        <View style={s.aiCard}>
          <View style={s.aiCardHeader}>
            <Text style={s.aiCardIcon}>✨</Text>
            <Text style={s.aiCardTitle}>AI Summary</Text>
            <View style={{ flex: 1 }} />
            {isTranslating && <ActivityIndicator size="small" color="#6366F1" />}
            <Text style={s.aiToggleSmLabel}>AI insight</Text>
            <Switch value={aiOn} onValueChange={handleTranslateToggle} trackColor={{ false: '#CBD5E1', true: '#6366F1' }} thumbColor="#FFF" style={{ transform: [{ scale: 0.6 }] }} />
          </View>
          {aiInsights?.keyPoints?.map((point, i) => (
            <View key={i} style={s.aiRow}>
              <Text style={s.aiRowIcon}>{AI_ICONS[i] || '•'}</Text>
              <Text style={s.aiRowText}>{point}</Text>
            </View>
          ))}
          {aiInsights?.directAnswer && (
            <View style={s.aiRow}>
              <Text style={s.aiRowIcon}>{AI_ICONS[4]}</Text>
              <Text style={s.aiRowText}>{aiInsights.directAnswer}</Text>
            </View>
          )}

          {/* Listen to Summary button */}
          <TouchableOpacity style={s.listenBtn} onPress={handlePlaySummary} disabled={isPlaying}>
            <Text style={s.listenIcon}>{isPlaying ? '⏸️' : '🔉'}</Text>
            <Text style={s.listenText}>{isPlaying ? 'Playing...' : 'Listen to Summary'}</Text>
            {isPlaying && <ActivityIndicator size="small" color="#6366F1" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

/* ── Styles ──────────────────────────────────────── */

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

  emptyCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 },
  emptyText: { fontSize: 15, color: '#64748B', textAlign: 'center' },

  aiCard: { backgroundColor: '#F5F3FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#DDD6FE' },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  aiCardIcon: { fontSize: 18 },
  aiCardTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B' },
  aiToggleSmLabel: { fontSize: 11, color: '#6366F1', fontWeight: '600' },
  aiRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  aiRowIcon: { fontSize: 16, marginTop: 1 },
  aiRowText: { flex: 1, fontSize: 14, color: '#334155', lineHeight: 20 },

  listenBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, paddingVertical: 12, borderRadius: 10, backgroundColor: '#EDE9FE', borderWidth: 1, borderColor: '#DDD6FE' },
  listenIcon: { fontSize: 16 },
  listenText: { fontSize: 13, fontWeight: '600', color: '#6366F1' },
});
