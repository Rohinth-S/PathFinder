import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { TimelineEvent } from '@/types/schema';
import { BRAND_COLORS } from '../constants/colors';

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
  const { signOut } = useAuth();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my professional journey on PathFinder! https://pathfinder.app/u/${MOCK_USER.username}`,
      });
    } catch (error: any) {
      console.warn(error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

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
        
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
      <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
        <Text style={s.shareIcon}>🔗</Text>
        <Text style={s.shareText}>Share Profile Link</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND_COLORS.cream },
  content: { padding: 20, paddingBottom: 40 },

  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: BRAND_COLORS.navy, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800', color: BRAND_COLORS.white },
  username: { fontSize: 20, fontWeight: '700', color: BRAND_COLORS.navy, marginBottom: 8 },
  repRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  repStar: { fontSize: 14 },
  repLabel: { fontSize: 14, color: BRAND_COLORS.slate },
  repValue: { fontSize: 16, fontWeight: '800', color: BRAND_COLORS.rust },

  signOutBtn: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: BRAND_COLORS.tan },
  signOutText: { color: BRAND_COLORS.navy, fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: BRAND_COLORS.white, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: BRAND_COLORS.border },
  statNum: { fontSize: 28, fontWeight: '800', color: BRAND_COLORS.rust },
  statLabel: { fontSize: 13, color: BRAND_COLORS.slate, marginTop: 4, fontWeight: '600' },

  ctaBtn: { backgroundColor: BRAND_COLORS.rust, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, gap: 8, marginBottom: 28, shadowColor: BRAND_COLORS.rust, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  ctaEmoji: { fontSize: 18 },
  ctaText: { color: BRAND_COLORS.white, fontSize: 16, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: BRAND_COLORS.navy, marginBottom: 16 },

  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLineCol: { width: 24, alignItems: 'center' },
  stepDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: BRAND_COLORS.tan, marginTop: 16, zIndex: 1 },
  stepDotVerified: { backgroundColor: BRAND_COLORS.teal },
  stepLine: { width: 3, flex: 1, backgroundColor: BRAND_COLORS.teal, marginTop: -2 },
  stepCard: { flex: 1, backgroundColor: BRAND_COLORS.white, borderRadius: 12, padding: 14, marginLeft: 10, marginBottom: 12, borderWidth: 1, borderColor: BRAND_COLORS.border },
  stepTitle: { fontSize: 16, fontWeight: '700', color: BRAND_COLORS.navy, marginBottom: 2 },
  stepMeta: { fontSize: 12, color: BRAND_COLORS.slate, marginBottom: 6, fontWeight: '500' },
  stepSummary: { fontSize: 14, color: BRAND_COLORS.slate, lineHeight: 20 },

  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: BRAND_COLORS.navy, marginTop: 20 },
  shareIcon: { fontSize: 16 },
  shareText: { fontSize: 15, fontWeight: '700', color: BRAND_COLORS.navy },
});
