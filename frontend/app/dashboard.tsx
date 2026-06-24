import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TimelineEvent } from '@/types/schema';

const MOCK_USER = {
  username: 'rohinth-s',
  reputationScore: 72,
  journeysShared: 2,
  peopleHelped: 14,
};

const MY_TIMELINE: TimelineEvent[] = [
  {
    id: 'my-1', title: 'CS Undergraduate',
    startDate: '2020', endDate: '2024', organization: 'Anna University',
    isVerified: true, nodeType: 'Education', emotionLabel: 'Confident',
    timelineSummary: 'Studied Computer Science, built projects in React Native and ML.',
    expandedDetails: { context: 'Formal education.', challengeFaced: 'Balancing academics and side projects.', outcome: 'Built 5+ production apps.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['React Native', 'Python', 'ML'], transitions: [] },
  },
  {
    id: 'my-2', title: 'Hackathon Builder',
    startDate: '2024', endDate: 'Present', organization: 'Self',
    isVerified: false, nodeType: 'Startup', emotionLabel: 'Confident',
    timelineSummary: 'Participating in hackathons and building PathFinder.',
    expandedDetails: { context: 'Building real products.', challengeFaced: 'Time pressure and team coordination.', outcome: 'Shipped PathFinder MVP.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Expo', 'TypeScript', 'Neo4j'], transitions: [] },
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Profile Header */}
      <View style={s.profileHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{MOCK_USER.username[0].toUpperCase()}</Text>
        </View>
        <Text style={s.username}>@{MOCK_USER.username}</Text>
        <View style={s.repRow}>
          <Text style={s.repStar}>⭐</Text>
          <Text style={s.repLabel}>Reputation Score: </Text>
          <Text style={s.repValue}>{MOCK_USER.reputationScore}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statNum}>{MOCK_USER.journeysShared}</Text>
          <Text style={s.statLabel}>Journeys Shared</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statNum}>{MOCK_USER.peopleHelped}</Text>
          <Text style={s.statLabel}>People Helped</Text>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity style={s.ctaBtn} onPress={() => router.push('/share-journey')}>
        <Text style={s.ctaEmoji}>✍️</Text>
        <Text style={s.ctaText}>Share / Update Your Journey</Text>
      </TouchableOpacity>

      {/* My Life Graph */}
      <Text style={s.sectionTitle}>My Life Graph</Text>
      {MY_TIMELINE.map((event, idx) => {
        const isLast = idx === MY_TIMELINE.length - 1;
        return (
          <TouchableOpacity
            key={event.id}
            style={s.stepRow}
            onPress={() => router.push({ pathname: '/journey-details', params: { eventData: JSON.stringify(event) } })}
            activeOpacity={0.7}
          >
            <View style={s.stepLineCol}>
              <View style={[s.stepDot, event.isVerified && s.stepDotVerified]} />
              {!isLast && <View style={s.stepLine} />}
            </View>
            <View style={s.stepCard}>
              <Text style={s.stepTitle}>{event.title}</Text>
              <Text style={s.stepMeta}>{event.startDate} – {event.endDate}  •  {event.organization}</Text>
              <Text style={s.stepSummary} numberOfLines={2}>{event.timelineSummary}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Share Profile */}
      <TouchableOpacity style={s.shareBtn}>
        <Text style={s.shareIcon}>🔗</Text>
        <Text style={s.shareText}>Share Profile Link</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },

  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  username: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  repRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  repStar: { fontSize: 14 },
  repLabel: { fontSize: 14, color: '#64748B' },
  repValue: { fontSize: 16, fontWeight: '800', color: '#6366F1' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statNum: { fontSize: 28, fontWeight: '800', color: '#6366F1' },
  statLabel: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500' },

  ctaBtn: { backgroundColor: '#6366F1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, gap: 8, marginBottom: 28 },
  ctaEmoji: { fontSize: 18 },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },

  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLineCol: { width: 24, alignItems: 'center' },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#CBD5E1', marginTop: 16, zIndex: 1 },
  stepDotVerified: { backgroundColor: '#10B981' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginTop: -2 },
  stepCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginLeft: 10, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  stepMeta: { fontSize: 12, color: '#94A3B8', marginBottom: 6 },
  stepSummary: { fontSize: 14, color: '#64748B', lineHeight: 20 },

  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#6366F1', marginTop: 20 },
  shareIcon: { fontSize: 16 },
  shareText: { fontSize: 15, fontWeight: '600', color: '#6366F1' },
});
