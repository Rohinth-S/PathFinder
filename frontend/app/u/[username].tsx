import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { UI } from '../../constants/colors';
import { getCommunityJourney, CommunityJourney } from '../../api/community.api';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SectionLabel } from '../../components/ui/SectionLabel';

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
      <View style={{ flex: 1, backgroundColor: UI.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={UI.accent} />
      </View>
    );
  }

  if (error || !journey) {
    return (
      <View style={{ flex: 1, backgroundColor: UI.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>😔</Text>
        <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 22, color: UI.foreground, textAlign: 'center', marginBottom: 8 }}>
          {error || "User not found"}
        </Text>
        <TouchableOpacity
          onPress={fetchJourney}
          activeOpacity={0.7}
          style={{
            paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999,
            backgroundColor: UI.accent, marginTop: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const user = journey?.user || {} as any;
  const experiences = journey?.experiences || [];
  const sortedExperiences = [...experiences].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <View style={{ flex: 1, backgroundColor: UI.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16 }}>
        <TouchableOpacity
          onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }}
          activeOpacity={0.7}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="arrow-left" size={20} color={UI.foreground} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: UI.foreground }}>Public Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 36, backgroundColor: UI.surfaceInverse,
              alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden'
            }}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={{ width: 72, height: 72 }} />
              ) : (
                <Text style={{ fontSize: 28, color: '#FFFFFF', fontFamily: 'Inter_700Bold' }}>
                  {(user.username || 'U')[0].toUpperCase()}
                </Text>
              )}
            </View>
            <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 24, color: UI.foreground, marginBottom: 6 }}>
              @{user.username || 'unknown'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14 }}>★</Text>
              <Text style={{ fontSize: 16, color: UI.accent, fontFamily: 'Inter_700Bold' }}>{user.reputationScore}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Share Button */}
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              paddingVertical: 14, borderRadius: 9999,
              backgroundColor: UI.accent, marginBottom: 32,
            }}
          >
            <Feather name="share-2" size={16} color="#FFFFFF" />
            <Text style={{ fontSize: 14, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }}>Share this Journey</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Timeline */}
        <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
          <SectionLabel style={{ marginBottom: 16 }}>LIFE GRAPH</SectionLabel>
        </Animated.View>

        {sortedExperiences.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={{ fontSize: 14, color: UI.fg50, fontFamily: 'Inter_400Regular', fontStyle: 'italic', textAlign: 'center' }}>
              This user hasn't added any experiences yet.
            </Text>
          </View>
        ) : (
          sortedExperiences.map((event, idx) => {
            const isLast = idx === sortedExperiences.length - 1;
            return (
              <Animated.View
                key={event.id}
                entering={FadeInDown.delay(350 + idx * 60).duration(400).springify()}
              >
                <View style={{ flexDirection: 'row' }}>
                  {/* Timeline dot + line */}
                  <View style={{ width: 24, alignItems: 'center' }}>
                    <View style={{
                      width: 12, height: 12, borderRadius: 6, marginTop: 16,
                      backgroundColor: event.isVerified ? UI.accent : UI.fg20,
                      zIndex: 2,
                    }} />
                    {!isLast && (
                      <View style={{ width: 2, flex: 1, backgroundColor: UI.fg08, marginTop: -2 }} />
                    )}
                  </View>

                  {/* Experience card */}
                  <View style={{
                    flex: 1, marginLeft: 12, marginBottom: 12,
                    backgroundColor: UI.surface, borderRadius: 16, padding: 16,
                    borderWidth: 1, borderColor: UI.fg08,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 15, color: UI.foreground, fontFamily: 'Inter_700Bold', flex: 1 }}>
                        {event.title}
                      </Text>
                      {event.isVerified && (
                        <View style={{
                          paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                          backgroundColor: UI.accentSoft,
                        }}>
                          <Text style={{ fontSize: 10, color: UI.accent, fontFamily: 'Inter_700Bold' }}>✓ Verified</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 12, color: UI.fg50, marginBottom: 6, fontFamily: 'Inter_600SemiBold' }}>
                      {event.startDate ? new Date(event.startDate).getFullYear() : 'Unknown'}
                      {event.endDate ? ` – ${new Date(event.endDate).getFullYear()}` : ' – Present'}
                      {event.organization ? `  •  ${event.organization}` : ''}
                    </Text>
                    <Text style={{ fontSize: 14, color: UI.fg80, lineHeight: 20, fontFamily: 'Inter_400Regular' }}>
                      {event.timelineSummary}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
