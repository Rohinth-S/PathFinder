import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DecisionAtlasBackendResponse, CommonPattern, UserTrajectory, TimelineEvent } from '@/types/schema';

const MOCK_PAYLOAD: DecisionAtlasBackendResponse = {
  structuredQuery: {
    queryType: "exploration",
    topics: ["Startup"],
    subtopics: ["SaaS / Tech"],
    skills: [],
    semanticQuery: "products built by SaaS founders before product market fit",
    focus: "products"
  },
  aggregatedContext: {
    journeyStatistics: { usersAnalyzed: 4, experiencesAnalyzed: 20 },
    commonPatterns: [
      { title: "Revenue Validation Through Pre‑Sales", description: "Creators packaged premium configurations, selling and preselling licenses to prove demand prior to building full scale code bases.", frequency: 4, percentage: 26.66 },
      { title: "Rapid MVP Sprint to Market", description: "Teams ran short, intensive development sprints to deliver a core MVP, achieving quick initial recurring revenue milestones.", frequency: 4, percentage: 26.66 }
    ],
    aiInsights: {
      directAnswer: "SaaS founders frequently started by validating demand through selling digital assets or preselling unbuilt SaaS licenses.",
      keyPoints: [
        "Digital assets and presales were used for early financial validation.",
        "Rapid MVPs focused on core data utility or automation were built."
      ],
      actionableTakeaway: "Validate market demand by preselling discounted licenses or packaging digital assets before full product development."
    },
    timelineFeed: [
      {
        username: "audience-builder-97",
        reputationScore: 88,
        timeline: [
          {
            id: "ab-97-e-aseel",
            title: "Associate Software Engineer",
            startDate: "2019-08-01",
            endDate: "2021-12-31",
            organization: "TCS Enterprise Innovation Lab",
            isVerified: true,
            timelineSummary: "Navigated corporate structures to script Java Spring Boot API wrappers exposing legacy IBM DB2 setups.",
            expandedDetails: {
              context: "Modernization pipeline for a Tier-1 retail banking giant.",
              challengeFaced: "Hyper-bureaucratic Jira workflows and slow architectural reviews.",
              outcome: "Mastered enterprise data pipeline workflows while observing severe data access bottlenecks.",
              achievements: null, applicationStatus: null, goals: [], skills: ["Enterprise API Design"], transitions: []
            }
          }
        ]
      }
    ]
  }
};

export default function ResultsPage() {
  const { structuredQuery, aggregatedContext } = MOCK_PAYLOAD;
  const { journeyStatistics, aiInsights, commonPatterns, timelineFeed } = aggregatedContext;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* 1. TOP METRICS HEADER PANEL */}
      <View style={styles.headerBlock}>
        <Text style={styles.queryText}>"{structuredQuery.semanticQuery}"</Text>
        <View style={styles.statsBadge}>
          <Text style={styles.statsText}>
            Analyzed: {journeyStatistics.usersAnalyzed} Paths across {journeyStatistics.experiencesAnalyzed} Experiences
          </Text>
        </View>
      </View>

      {/* 2. AI INSIGHTS SUMMATION BLOCK */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <Text style={styles.directAnswer}>{aiInsights.directAnswer}</Text>
        
        <View style={styles.bulletsContainer}>
          {aiInsights.keyPoints.map((point, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.takeawayBox}>
          <Text style={styles.takeawayLabel}>Actionable Takeaway</Text>
          <Text style={styles.takeawayText}>{aiInsights.actionableTakeaway}</Text>
        </View>
      </View>

      {/* 3. RECURRING TRAJECTORY PATHWAYS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Observed Pattern Routing</Text>
        {commonPatterns.map((pattern: CommonPattern, idx) => (
          <View key={idx} style={styles.patternContainer}>
            <Text style={styles.patternTitle}>{pattern.title}</Text>
            <Text style={styles.patternDesc}>{pattern.description}</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${pattern.percentage}%` }]} />
              </View>
              <Text style={styles.progressText}>{pattern.percentage.toFixed(1)}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 4. ANONYMIZED TIMELINE CAROUSEL / TIMELINE REPLAY FEED */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Real User Journeys</Text>
        {timelineFeed.map((user: UserTrajectory, idx) => (
          <View key={idx} style={styles.userTrajectory}>
            <View style={styles.userHeader}>
              <Text style={styles.username}>@{user.username}</Text>
              <View style={styles.reputationBadge}>
                <Text style={styles.reputationText}>Rep: {user.reputationScore}</Text>
              </View>
            </View>

            <View style={styles.timelineContainer}>
              {user.timeline.map((event: TimelineEvent, eventIdx) => (
                <View key={event.id} style={styles.timelineEventRow}>
                  <View style={styles.timelineLineColumn}>
                    <View style={[styles.timelineNode, event.isVerified && styles.timelineNodeVerified]} />
                    {eventIdx !== user.timeline.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.eventHeaderRow}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.isVerified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>✓ Verified</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.eventOrg}>{event.organization}</Text>
                    <Text style={styles.eventDate}>{event.startDate} — {event.endDate}</Text>
                    <View style={styles.summaryBox}>
                      <Text style={styles.summaryText}>{event.timelineSummary}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  headerBlock: {
    marginTop: 20,
    marginBottom: 8,
    alignItems: 'center',
  },
  queryText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  statsBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  directAnswer: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletsContainer: {
    gap: 8,
    marginBottom: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    color: '#38BDF8',
    fontSize: 18,
    lineHeight: 24,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  takeawayBox: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  takeawayLabel: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  takeawayText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  patternContainer: {
    marginBottom: 24,
  },
  patternTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  patternDesc: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 4,
  },
  progressText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    width: 48,
  },
  userTrajectory: {
    marginTop: 8,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  reputationBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reputationText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineEventRow: {
    flexDirection: 'row',
    minHeight: 120,
  },
  timelineLineColumn: {
    width: 24,
    alignItems: 'center',
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#475569',
    marginTop: 6,
    zIndex: 1,
  },
  timelineNodeVerified: {
    backgroundColor: '#10B981', // Emerald
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#334155',
    marginTop: -6,
    marginBottom: -6,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 32,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventTitle: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 8,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventOrg: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventDate: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
});
