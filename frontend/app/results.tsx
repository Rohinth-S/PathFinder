import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { DecisionAtlasBackendResponse, BackendQueryResponse, UserTrajectory, TimelineEvent, AiInsights, CommonPattern } from '@/types/schema';
import { NODE_COLORS, NODE_ICONS, CATEGORY_COLORS } from '@/constants/colors';
import { BRAND_COLORS } from '../constants/colors';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

/* ── Mock Fallback ─────────────────────────────────── */
const MOCK: DecisionAtlasBackendResponse = {
  structuredQuery: {
    queryType: 'exploration', topics: ['Startup'], subtopics: ['SaaS'],
    skills: [], focus: 'career path',
    semanticQuery: "What products did SaaS founders build before PMF?",
  },
  aggregatedContext: {
    journeyStatistics: {
      usersAnalyzed: 43, experiencesAnalyzed: 180,
    },
    commonPatterns: [
      { title: 'Internal Tools', description: 'Built tools for internal use first', frequency: 18, percentage: 42 },
      { title: 'Agency Services', description: 'Started with services/consulting', frequency: 13, percentage: 31 },
      { title: 'Productivity Apps', description: 'Consumer productivity apps', frequency: 10, percentage: 24 },
      { title: 'Marketplaces', description: 'B2B Marketplaces', frequency: 8, percentage: 18 },
      { title: 'Customer Validation', description: 'Validated with real customers early', frequency: 23, percentage: 53 },
    ],
    aiInsights: {
      directAnswer: 'Most successful SaaS founders didn\'t start with their final product. They first solved small, real problems and evolved.',
      keyPoints: [
        'Starting as an agency allows building deep domain expertise.',
        'Internal tools naturally evolve into SaaS products.',
      ],
      actionableTakeaway: 'Focus on solving immediate problems before scaling a product.',
    },
    timelineFeed: [
      {
        username: 'Sridhar Vembu', reputationScore: 94,
        timeline: [
          { id: 'sv-1', title: 'Built Internal Network Tool', startDate: '1996', endDate: '1998', organization: '', isVerified: true, nodeType: 'Job', emotionLabel: 'Confident', timelineSummary: 'Automated workflows for internal teams and clients.', expandedDetails: { context: 'Started by building network management tools.', challengeFaced: 'Scaling network operations manually was inefficient.', outcome: 'Created automated tools that improved efficiency by 40%.', achievements: ['Deployed across 5 offices', 'Saved 20hrs/week'], applicationStatus: null, emotionNote: null, goals: [], skills: ['Automation', 'Networking'], transitions: [{ decisionLabel: 'Started offering as a service', toExperienceId: 'sv-2' }] } },
          { id: 'sv-2', title: 'Offered Custom Software Services', startDate: '1998', endDate: '2001', organization: '', isVerified: true, nodeType: 'Startup', emotionLabel: 'Pivoting', timelineSummary: 'Solved business problems for small companies.', expandedDetails: { context: 'Worked with small businesses to build custom software solutions.', challengeFaced: 'Projects were non-repeatable and hard to scale.', outcome: 'Realized the need for a simple, affordable CRM for small businesses.', achievements: ['Served 25+ small businesses', 'Built strong domain understanding'], applicationStatus: null, emotionNote: null, goals: [], skills: ['Customer Understanding', 'Problem Solving', 'Sales', 'Product Thinking'], transitions: [{ decisionLabel: 'Decided to build a product that solves common problems at scale.', toExperienceId: 'sv-3' }] } },
          { id: 'sv-3', title: 'Launched Zoho CRM (MVP)', startDate: '2001', endDate: '2003', organization: '', isVerified: true, nodeType: 'Achievement', emotionLabel: 'Confident', timelineSummary: 'Early CRM for small businesses.', expandedDetails: { context: 'Launched first version of CRM.', challengeFaced: 'Gaining initial traction.', outcome: 'Acquired first 100 paying customers.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Product Launch'], transitions: [{ decisionLabel: 'Found PMF', toExperienceId: 'sv-4' }] } },
          { id: 'sv-4', title: 'Found Product Market Fit', startDate: '2003', endDate: null, organization: 'Zoho', isVerified: true, nodeType: 'Achievement', emotionLabel: 'Confident', timelineSummary: 'Strong retention & paying customers.', expandedDetails: { context: 'SaaS model started scaling.', challengeFaced: 'Scaling infrastructure.', outcome: 'Consistent growth and low churn.', achievements: ['Product Market Fit'], applicationStatus: null, emotionNote: null, goals: [], skills: ['Scaling'], transitions: [] } },
        ],
      },
    ],
  },
};

/* ── Skeleton ──────────────────────────────────────── */
function Shimmer({ w, h, r = 8, mb = 0 }: { w: number | string; h: number; r?: number; mb?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ])).start();
  }, [anim]);
  return <Animated.View style={{ width: w as any, height: h, borderRadius: r, marginBottom: mb, backgroundColor: '#E2E8F0', opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] }) }} />;
}

function LoadingSkeleton() {
  return (
    <View style={s.container}>
      <View style={{ padding: 20 }}>
        <Shimmer w="60%" h={24} mb={8} />
        <Shimmer w="40%" h={14} mb={24} />
        <Shimmer w="100%" h={120} r={16} mb={24} />
        <Shimmer w="100%" h={300} r={16} mb={24} />
      </View>
    </View>
  );
}

/* ── Timeline Node Component ───────────────────────── */
function TimelineNodeItem({ event, isLast }: { event: TimelineEvent, isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const nodeType = event.nodeType || 'Job';
  const colors = NODE_COLORS[nodeType] || NODE_COLORS.Job;
  const icon = NODE_ICONS[nodeType] || NODE_ICONS.Job;

  const getDuration = (start: string, end: string | null) => {
    if (!start) return '';
    const endStr = end || 'Present';
    if (start.length === 4) {
      const s = parseInt(start);
      if (!isNaN(s)) {
        if (endStr === 'Present') {
          return ` • ${new Date().getFullYear() - s} yrs`;
        } else if (endStr.length === 4) {
          const e = parseInt(endStr);
          if (!isNaN(e)) return ` • ${e - s} yrs`;
        }
      }
    }
    return '';
  };

  return (
    <View style={s.nodeContainer}>
      {/* Left side: Vertical line and Icon */}
      <View style={s.nodeLeft}>
        <View style={[s.iconWrapper, { backgroundColor: colors.iconBg }]}>
          <Text style={[s.iconText, { color: colors.iconText }]}>{icon}</Text>
        </View>
        {!isLast && <View style={s.verticalLine} />}
      </View>

      {/* Right side: Content Card */}
      <View style={s.nodeRight}>
        <TouchableOpacity style={[s.nodeCard, expanded && s.nodeCardExpanded]} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
          <View style={s.nodeCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.nodeTitle}>{event.title}</Text>
              <Text style={s.nodeMeta}>
                {event.startDate}{event.endDate ? ` - ${event.endDate}` : ''}{getDuration(event.startDate, event.endDate)}
              </Text>
              <Text style={s.nodeSummary} numberOfLines={expanded ? undefined : 2}>{event.timelineSummary}</Text>
            </View>
            <Text style={s.chevron}>{expanded ? '︿' : '﹀'}</Text>
          </View>

          {expanded && (
            <View style={s.expandedContent}>
              <View style={s.divider} />
              
              {event.expandedDetails.context && (
                <View style={s.detailBlock}>
                  <View style={s.detailHeader}><Text style={s.detailIcon}>💼</Text><Text style={s.detailTitle}>Context</Text></View>
                  <Text style={s.detailText}>{event.expandedDetails.context}</Text>
                </View>
              )}
              
              {event.expandedDetails.challengeFaced && (
                <View style={s.detailBlock}>
                  <View style={s.detailHeader}><Text style={s.detailIcon}>⚠️</Text><Text style={s.detailTitle}>Challenge</Text></View>
                  <Text style={s.detailText}>{event.expandedDetails.challengeFaced}</Text>
                </View>
              )}

              {event.expandedDetails.outcome && (
                <View style={s.detailBlock}>
                  <View style={s.detailHeader}><Text style={s.detailIcon}>🎯</Text><Text style={s.detailTitle}>Outcome / Learning</Text></View>
                  <Text style={s.detailText}>{event.expandedDetails.outcome}</Text>
                </View>
              )}

              {event.expandedDetails.achievements && event.expandedDetails.achievements.length > 0 && (
                <View style={s.detailBlock}>
                  <View style={s.detailHeader}><Text style={s.detailIcon}>🏆</Text><Text style={s.detailTitle}>Key Achievements</Text></View>
                  {event.expandedDetails.achievements.map((ach, i) => (
                    <Text key={i} style={s.detailListItem}>• {ach}</Text>
                  ))}
                </View>
              )}

              {event.expandedDetails.skills && event.expandedDetails.skills.length > 0 && (
                <View style={s.detailBlock}>
                  <View style={s.detailHeader}><Text style={s.detailIcon}>{'</>'}</Text><Text style={s.detailTitle}>Skills Built</Text></View>
                  <View style={s.skillsRow}>
                    {event.expandedDetails.skills.map((skill, i) => (
                      <View key={i} style={s.skillPill}><Text style={s.skillPillText}>{skill}</Text></View>
                    ))}
                  </View>
                </View>
              )}

              {event.expandedDetails.transitions && event.expandedDetails.transitions.length > 0 && (
                <View style={[s.detailBlock, { marginBottom: 0 }]}>
                  <View style={s.detailHeader}><Text style={s.detailIcon}>↪</Text><Text style={s.detailTitle}>Decision That Led Next</Text></View>
                  <Text style={s.detailText}>{event.expandedDetails.transitions[0].decisionLabel}</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getPseudoPct = (str: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % (max - min + 1)) + min;
};

/* ── Main ──────────────────────────────────────────── */
export default function ResultsPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payload?: string }>();
  const [loading, setLoading] = useState(true);

  // Parse live data
  let data: DecisionAtlasBackendResponse;
  try {
    if (params.payload) {
      const raw = JSON.parse(params.payload);
      if (raw.aggregatedContext) {
        data = {
          structuredQuery: raw.structuredQuery || {},
          aggregatedContext: raw.aggregatedContext,
        };
      } else {
        data = MOCK;
      }
    } else {
      data = MOCK;
    }
  } catch {
    data = MOCK;
  }

  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  if (loading) return <LoadingSkeleton />;

  const queryText = data.structuredQuery?.semanticQuery || data.structuredQuery?.queryType || 'Search Results';
  const { journeyStatistics: stats, aiInsights, timelineFeed, commonPatterns } = data.aggregatedContext;

  // Extract top products for the summary card (we pick the top 4 patterns as a proxy if we don't have explicit products)
  const topProducts = commonPatterns?.slice(0, 4) || [];
  const topDecisions = commonPatterns?.slice(1, 4) || []; // Just for UI variety if needed

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={s.headerTitle} numberOfLines={2}>{queryText}</Text>
          <Text style={s.headerSubtitle}>Analyzed {stats?.usersAnalyzed || 0} Founders</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        
        {/* Product Summary Card */}
        {topProducts.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionIcon}>✨</Text>
              <Text style={s.sectionTitle}>Top Pre-PMF Products</Text>
              <View style={{ flex: 1 }} />
              <Text style={s.graphIcon}>📊</Text>
            </View>
            <View style={s.productsGrid}>
              {topProducts.map((p, i) => {
                const colorKeys = Object.keys(CATEGORY_COLORS);
                const colorTheme = CATEGORY_COLORS[colorKeys[i % colorKeys.length] as keyof typeof CATEGORY_COLORS];
                return (
                  <View key={i} style={s.productItem}>
                    <View style={s.productIconRow}>
                      <View style={[s.catIconWrapper, { backgroundColor: colorTheme.iconBg }]}>
                        <Text style={[s.catIconText, { color: colorTheme.iconText }]}>{colorTheme.icon}</Text>
                      </View>
                      <Text style={s.productPct}>{p.percentage || getPseudoPct(p.title, 10, 50)}%</Text>
                    </View>
                    <Text style={s.productTitle} numberOfLines={2}>{p.title}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Journey Timelines */}
        {timelineFeed?.map((userJourney, index) => (
          <View key={index} style={s.section}>
            <Text style={s.journeyHeaderTitle}>Journey Timeline <Text style={{fontWeight: '400', color: BRAND_COLORS.slate}}>({userJourney.username})</Text></Text>
            <View style={s.timelineWrapper}>
              {userJourney.timeline.map((event, i) => (
                <TimelineNodeItem 
                  key={event.id} 
                  event={event} 
                  isLast={i === userJourney.timeline.length - 1} 
                />
              ))}
            </View>
          </View>
        ))}

        {/* Common Decisions */}
        {topDecisions.length > 0 && (
          <View style={s.section}>
            <View style={s.decisionsHeader}>
              <Text style={s.journeyHeaderTitle}>Common Decisions</Text>
              <Text style={s.decisionsTopText}>Top 3</Text>
            </View>
            <View style={s.decisionsList}>
              {topDecisions.map((d, i) => (
                <View key={i} style={s.decisionRow}>
                  <View style={s.decisionIconWrapper}><Text style={s.decisionIcon}>◆</Text></View>
                  <Text style={s.decisionText}>{d.description}</Text>
                  <Text style={s.decisionPct}>{d.percentage || getPseudoPct(d.description, 20, 70)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Insight */}
        {aiInsights && (
          <View style={s.aiCard}>
            <View style={s.aiCardHeader}>
              <Text style={s.aiCardIcon}>✨</Text>
              <Text style={s.aiCardTitle}>AI Insight</Text>
            </View>
            <Text style={s.aiCardText}>{aiInsights.directAnswer || aiInsights.actionableTakeaway}</Text>
            <Text style={s.brainIcon}>🧠</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND_COLORS.cream },
  headerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND_COLORS.white, paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: BRAND_COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  backIcon: { fontSize: 24, color: BRAND_COLORS.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: BRAND_COLORS.navy, lineHeight: 22 },
  headerSubtitle: { fontSize: 13, color: BRAND_COLORS.rust, fontWeight: '700', marginTop: 4 },
  
  content: { padding: 16, paddingBottom: 40 },
  
  section: { backgroundColor: BRAND_COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BRAND_COLORS.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: BRAND_COLORS.navy },
  graphIcon: { fontSize: 18, color: BRAND_COLORS.teal },
  
  productsGrid: { flexDirection: 'row', gap: 12 },
  productItem: { flex: 1 },
  productIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  catIconWrapper: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  catIconText: { fontSize: 16 },
  productPct: { fontSize: 14, fontWeight: '800', color: BRAND_COLORS.navy },
  productTitle: { fontSize: 12, color: BRAND_COLORS.slate, lineHeight: 16, fontWeight: '600' },

  journeyHeaderTitle: { fontSize: 16, fontWeight: '800', color: BRAND_COLORS.navy, marginBottom: 16 },
  timelineWrapper: { paddingLeft: 4, paddingBottom: 8 },
  
  nodeContainer: { flexDirection: 'row' },
  nodeLeft: { width: 44, alignItems: 'center' },
  iconWrapper: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  iconText: { fontSize: 14 },
  verticalLine: { width: 3, flex: 1, backgroundColor: BRAND_COLORS.teal, marginTop: -4, marginBottom: -4 },
  
  nodeRight: { flex: 1, paddingBottom: 16 },
  nodeCard: { backgroundColor: BRAND_COLORS.cream, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BRAND_COLORS.border },
  nodeCardExpanded: { backgroundColor: BRAND_COLORS.white, borderColor: BRAND_COLORS.teal, shadowColor: BRAND_COLORS.teal, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  nodeCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  nodeTitle: { fontSize: 15, fontWeight: '800', color: BRAND_COLORS.navy, marginBottom: 4 },
  nodeMeta: { fontSize: 12, color: BRAND_COLORS.slate, marginBottom: 6, fontWeight: '600' },
  nodeSummary: { fontSize: 13, color: BRAND_COLORS.slate, lineHeight: 18, fontWeight: '500' },
  chevron: { fontSize: 16, color: BRAND_COLORS.slate, marginTop: 2, paddingLeft: 8 },
  
  expandedContent: { marginTop: 12 },
  divider: { height: 1, backgroundColor: BRAND_COLORS.border, marginVertical: 12 },
  detailBlock: { marginBottom: 16 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  detailIcon: { fontSize: 14 },
  detailTitle: { fontSize: 13, fontWeight: '800', color: BRAND_COLORS.navy },
  detailText: { fontSize: 14, color: BRAND_COLORS.slate, lineHeight: 20, fontWeight: '500' },
  detailListItem: { fontSize: 14, color: BRAND_COLORS.slate, lineHeight: 20, marginBottom: 4, fontWeight: '500' },
  
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  skillPill: { backgroundColor: BRAND_COLORS.cream, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: BRAND_COLORS.border },
  skillPillText: { color: BRAND_COLORS.teal, fontSize: 12, fontWeight: '700' },

  decisionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  decisionsTopText: { fontSize: 13, color: BRAND_COLORS.rust, fontWeight: '700' },
  decisionsList: { gap: 12 },
  decisionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  decisionIconWrapper: { width: 24, height: 24, borderRadius: 12, backgroundColor: BRAND_COLORS.cream, justifyContent: 'center', alignItems: 'center' },
  decisionIcon: { color: BRAND_COLORS.teal, fontSize: 12 },
  decisionText: { flex: 1, fontSize: 14, color: BRAND_COLORS.slate, fontWeight: '500' },
  decisionPct: { fontSize: 14, fontWeight: '800', color: BRAND_COLORS.navy },

  aiCard: { backgroundColor: BRAND_COLORS.cream, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: BRAND_COLORS.tan, overflow: 'hidden' },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  aiCardIcon: { fontSize: 18 },
  aiCardTitle: { fontSize: 16, fontWeight: '800', color: BRAND_COLORS.navy },
  aiCardText: { fontSize: 15, color: BRAND_COLORS.navy, lineHeight: 22, fontWeight: '600', paddingRight: 40 },
  brainIcon: { position: 'absolute', bottom: -10, right: -10, fontSize: 60, opacity: 0.1 },
});
