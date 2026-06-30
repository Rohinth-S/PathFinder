import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BRAND_COLORS } from '../../constants/colors';
import { getCommunityJourney, CommunityJourney } from '../../api/community.api';

export default function PublicProfilePage() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();

  const [journey, setJourney] = useState<CommunityJourney | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      fetchJourney();
    }
  }, [username]);

  const fetchJourney = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCommunityJourney(username!);
      setJourney(data);
    } catch (e: any) {
      setError(e.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${username || 'this user'}'s professional journey on PathFinder! https://pathfinder.app/u/${username || 'unknown'}`,
      });
    } catch (error: any) {
      console.warn(error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  if (error || !journey) {
    return (
      <View style={[s.container, s.center]}>
        <Text style={s.errorText}>{error || "User not found"}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={fetchJourney}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { user, experiences } = journey;
  const sortedExperiences = [...experiences].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Public Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Profile */}
      <View style={s.profileBlock}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{(user.username || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={s.username}>@{user.username || 'unknown'}</Text>
        <View style={s.repRow}>
          <Text style={s.repStar}>⭐</Text>
          <Text style={s.repValue}>{user.reputationScore}</Text>
        </View>
      </View>

      {/* Share Button */}
      <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
        <Text style={s.shareIcon}>🔗</Text>
        <Text style={s.shareText}>Share this Journey</Text>
      </TouchableOpacity>

      {/* Timeline */}
      <Text style={s.sectionTitle}>Life Graph</Text>
      {sortedExperiences.length === 0 ? (
        <Text style={s.emptyText}>This user hasn't added any experiences yet.</Text>
      ) : (
        sortedExperiences.map((event, idx) => {
          const isLast = idx === sortedExperiences.length - 1;
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
                <Text style={s.stepMeta}>
                  {event.startDate ? new Date(event.startDate).getFullYear() : 'Unknown'} 
                  {event.endDate ? ` – ${new Date(event.endDate).getFullYear()}` : ' – Present'}  •  {event.organization}
                </Text>
                <Text style={s.stepSummary}>{event.timelineSummary}</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND_COLORS.cream },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { padding: 20, paddingBottom: 40 },
  errorText: { fontSize: 16, color: BRAND_COLORS.rust, marginBottom: 16 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: BRAND_COLORS.navy, borderRadius: 8 },
  retryText: { color: BRAND_COLORS.white, fontWeight: '700' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backArrow: { fontSize: 22, color: BRAND_COLORS.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: BRAND_COLORS.navy },

  profileBlock: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: BRAND_COLORS.navy, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800', color: BRAND_COLORS.white },
  username: { fontSize: 20, fontWeight: '700', color: BRAND_COLORS.navy, marginBottom: 6 },
  repRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  repStar: { fontSize: 14 },
  repValue: { fontSize: 16, fontWeight: '800', color: BRAND_COLORS.teal },

  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: BRAND_COLORS.rust, marginBottom: 28, shadowColor: BRAND_COLORS.rust, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  shareIcon: { fontSize: 16 },
  shareText: { fontSize: 15, fontWeight: '700', color: BRAND_COLORS.white },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: BRAND_COLORS.navy, marginBottom: 16 },
  emptyText: { fontSize: 14, color: BRAND_COLORS.slate, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },

  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLineCol: { width: 24, alignItems: 'center' },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND_COLORS.border, marginTop: 16, zIndex: 1 },
  stepDotVerified: { backgroundColor: BRAND_COLORS.teal },
  stepLine: { width: 2, flex: 1, backgroundColor: BRAND_COLORS.border, marginTop: -2 },
  stepCard: { flex: 1, backgroundColor: BRAND_COLORS.white, borderRadius: 12, padding: 14, marginLeft: 10, marginBottom: 12, borderWidth: 1, borderColor: BRAND_COLORS.border },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  stepTitle: { fontSize: 16, fontWeight: '800', color: BRAND_COLORS.navy, flex: 1 },
  verifiedBadge: { backgroundColor: BRAND_COLORS.cream, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  verifiedText: { color: BRAND_COLORS.teal, fontSize: 10, fontWeight: '700' },
  stepMeta: { fontSize: 12, color: BRAND_COLORS.slate, marginBottom: 6, fontWeight: '600' },
  stepSummary: { fontSize: 14, color: BRAND_COLORS.slate, lineHeight: 20, fontWeight: '500' },
});
