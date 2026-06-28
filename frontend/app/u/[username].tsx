import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TimelineEvent } from '@/types/schema';

const PUBLIC_TIMELINE: TimelineEvent[] = [
  {
    id: 'pub-1', title: 'CS Undergraduate',
    startDate: '2020', endDate: '2024', organization: 'Anna University',
    isVerified: true, nodeType: 'Education', emotionLabel: 'Confident',
    timelineSummary: 'Studied Computer Science, built projects in React Native and ML.',
    expandedDetails: { context: '', challengeFaced: '', outcome: '', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: [], transitions: [] },
  },
  {
    id: 'pub-2', title: 'Hackathon Builder',
    startDate: '2024', endDate: 'Present', organization: 'Self',
    isVerified: false, nodeType: 'Startup', emotionLabel: 'Confident',
    timelineSummary: 'Participating in hackathons and building PathFinder.',
    expandedDetails: { context: '', challengeFaced: '', outcome: '', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: [], transitions: [] },
  },
];

export default function PublicProfilePage() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${username || 'this user'}'s professional journey on PathFinder! https://pathfinder.app/u/${username || 'unknown'}`,
      });
    } catch (error: any) {
      console.warn(error.message);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Public Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Profile */}
      <View style={s.profileBlock}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{(username || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={s.username}>@{username || 'unknown'}</Text>
        <View style={s.repRow}>
          <Text style={s.repStar}>⭐</Text>
          <Text style={s.repValue}>72</Text>
        </View>
      </View>

      {/* Share Button */}
      <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
        <Text style={s.shareIcon}>🔗</Text>
        <Text style={s.shareText}>Share this Journey</Text>
      </TouchableOpacity>

      {/* Timeline */}
      <Text style={s.sectionTitle}>Life Graph</Text>
      {PUBLIC_TIMELINE.map((event, idx) => {
        const isLast = idx === PUBLIC_TIMELINE.length - 1;
        return (
          <View key={event.id} style={s.stepRow}>
            <View style={s.stepLineCol}>
              <View style={[s.stepDot, event.isVerified && s.stepDotVerified]} />
              {!isLast && <View style={s.stepLine} />}
            </View>
            <View style={s.stepCard}>
              <View style={s.stepTitleRow}>
                <Text style={s.stepTitle}>{event.title}</Text>
                {event.isVerified && (
                  <View style={s.verifiedBadge}>
                    <Text style={s.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>
              <Text style={s.stepMeta}>{event.startDate} – {event.endDate}  •  {event.organization}</Text>
              <Text style={s.stepSummary}>{event.timelineSummary}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backArrow: { fontSize: 22, color: '#1E293B' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },

  profileBlock: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  username: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  repRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  repStar: { fontSize: 14 },
  repValue: { fontSize: 16, fontWeight: '800', color: '#6366F1' },

  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: '#6366F1', marginBottom: 28 },
  shareIcon: { fontSize: 16 },
  shareText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },

  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLineCol: { width: 24, alignItems: 'center' },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#CBD5E1', marginTop: 16, zIndex: 1 },
  stepDotVerified: { backgroundColor: '#10B981' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginTop: -2 },
  stepCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginLeft: 10, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 },
  verifiedBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  verifiedText: { color: '#059669', fontSize: 10, fontWeight: '700' },
  stepMeta: { fontSize: 12, color: '#94A3B8', marginBottom: 6 },
  stepSummary: { fontSize: 14, color: '#64748B', lineHeight: 20 },
});
