import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, ActivityIndicator, Image } from 'react-native';
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
      <View className="flex-1 bg-brand-cream justify-center items-center p-5">
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  if (error || !journey) {
    return (
      <View className="flex-1 bg-brand-cream justify-center items-center p-5">
        <Text className="text-base text-brand-rust mb-4">{error || "User not found"}</Text>
        <TouchableOpacity className="px-5 py-2.5 bg-brand-navy rounded-lg" onPress={fetchJourney}>
          <Text className="text-brand-white font-bold">Retry</Text>
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
    <ScrollView className="flex-1 bg-brand-cream" contentContainerClassName="p-5 pb-10">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }}>
          <Text className="text-[22px] text-brand-navy">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-brand-navy">Public Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Profile */}
      <View className="items-center mb-5">
        <View className="w-[72px] h-[72px] rounded-full bg-brand-navy justify-center items-center mb-3 overflow-hidden">
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={{ width: 72, height: 72 }} />
          ) : (
            <Text className="text-[28px] font-extrabold text-brand-white">{(user.username || 'U')[0].toUpperCase()}</Text>
          )}
        </View>
        <Text className="text-xl font-bold text-brand-navy mb-1.5">@{user.username || 'unknown'}</Text>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-sm">⭐</Text>
          <Text className="text-base font-extrabold text-brand-teal">{user.reputationScore}</Text>
        </View>
      </View>

      {/* Share Button */}
      <TouchableOpacity 
        className="flex-row items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-rust mb-7 elevation-4 shadow-sm" 
        onPress={handleShare}
      >
        <Text className="text-base">🔗</Text>
        <Text className="text-[15px] font-bold text-brand-white">Share this Journey</Text>
      </TouchableOpacity>

      {/* Timeline */}
      <Text className="text-lg font-extrabold text-brand-navy mb-4">Life Graph</Text>
      {sortedExperiences.length === 0 ? (
        <Text className="text-sm text-brand-slate italic text-center mt-5">This user hasn't added any experiences yet.</Text>
      ) : (
        sortedExperiences.map((event, idx) => {
          const isLast = idx === sortedExperiences.length - 1;
          return (
            <View key={event.id} className="flex-row mb-0">
              <View className="w-6 items-center">
                <View className={`w-3 h-3 rounded-full mt-4 z-10 ${event.isVerified ? 'bg-brand-teal' : 'bg-brand-border'}`} />
                {!isLast && <View className="w-[2px] flex-1 bg-brand-border -mt-0.5" />}
              </View>
              <View className="flex-1 bg-brand-white rounded-xl p-3.5 ml-2.5 mb-3 border border-brand-border">
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text className="text-base font-extrabold text-brand-navy flex-1">{event.title}</Text>
                  {event.isVerified && (
                    <View className="bg-brand-cream px-2 py-[3px] rounded-lg">
                      <Text className="text-brand-teal text-[10px] font-bold">✓ Verified</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-brand-slate mb-1.5 font-semibold">
                  {event.startDate ? new Date(event.startDate).getFullYear() : 'Unknown'} 
                  {event.endDate ? ` – ${new Date(event.endDate).getFullYear()}` : ' – Present'}  •  {event.organization}
                </Text>
                <Text className="text-sm text-brand-slate leading-5 font-medium">{event.timelineSummary}</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}


