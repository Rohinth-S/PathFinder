import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { L } from '../../constants/colors';
import { getGlobalFeed, FeedExperience, getCommunityGraph, CommunityGraph } from '../../api/community.api';
import { useAuth } from '@clerk/clerk-expo';
import { VisualGraph } from '../../components/community/VisualGraph';

function FeedCard({ 
  experience, 
  onViewJourney
}: { 
  experience: FeedExperience; 
  onViewJourney: () => void;
}) {
  const initial = (experience.authorUsername || '?')[0].toUpperCase();

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      padding: 20, borderColor: L.border,
      paddingHorizontal: 20, paddingVertical: 20, marginBottom: 16,
    }}>
      {/* Header: avatar + username + verified badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <TouchableOpacity onPress={onViewJourney} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <View style={{
            width: 46, height: 46, borderRadius: 23, backgroundColor: L.tealTint,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18, color: L.teal, fontFamily: 'Inter_700Bold' }}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16, color: L.navy, fontFamily: 'Inter_700Bold' }}>@{experience.authorUsername || 'unknown'}</Text>
              {experience.isVerified && (
                <Feather name="check-circle" size={14} color={L.teal} />
              )}
            </View>
            {experience.authorSummary ? (
              <Text style={{ fontSize: 13, color: L.navySoft, fontFamily: 'Inter_500Medium', marginTop: 2, paddingRight: 8 }} numberOfLines={2}>
                {experience.authorSummary}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>

      {/* Title & Context */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 22, color: L.navy, fontFamily: 'InstrumentSerif_400Regular', marginBottom: 8 }}>
          {experience.title}
        </Text>
        <Text
          style={{ fontSize: 15, color: '#334155', lineHeight: 24, fontFamily: 'Inter_400Regular' }}
        >
          {experience.context}
        </Text>
      </View>

      {/* Outcome */}
      {experience.outcome && (
        <View style={{ marginBottom: 16, padding: 14, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Feather name="award" size={14} color={L.teal} />
            <Text style={{ fontSize: 12, color: L.teal, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Outcome</Text>
          </View>
          <Text style={{ fontSize: 14, color: L.navy, fontFamily: 'Inter_500Medium', lineHeight: 22 }}>
            {experience.outcome}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: L.border }}>
        <TouchableOpacity
          onPress={onViewJourney}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Text style={{ fontSize: 13, color: L.teal, fontFamily: 'Inter_600SemiBold' }}>
            Full Journey
          </Text>
          <Feather name="arrow-right" size={16} color={L.teal} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SkeletonCard() {
  return (
    <View style={{
      backgroundColor: L.tealTint, borderRadius: 20, height: 240, marginBottom: 16,
      opacity: 0.5,
    }} />
  );
}

export default function ExplorePage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [feed, setFeed] = useState<FeedExperience[]>([]);
  const [graph, setGraph] = useState<CommunityGraph | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const token = await getToken() || undefined;
      const [feedData, graphData] = await Promise.all([
        getGlobalFeed(token, 1, 30),
        getCommunityGraph()
      ]);
      setFeed(feedData);
      setGraph(graphData);
    } catch (e: any) {
      console.warn('Failed to fetch feed:', e);
      setFeed([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchFeed();
  }, []);

  const renderFeedCard = useCallback(({ item, index }: { item: FeedExperience; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(20)}>
      <FeedCard
        experience={item}
        onViewJourney={() => router.push(`/u/${item.authorUsername || 'unknown'}`)}
      />
    </Animated.View>
  ), [router]);

  return (
    <View style={{ flex: 1, backgroundColor: L.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16 }}>
        <Text style={{
          fontFamily: 'InstrumentSerif_400Regular',
          fontSize: 32, color: L.navy, marginBottom: 4,
        }}>
          Explore
        </Text>
        <Text style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 14, color: L.navySoft, lineHeight: 20,
        }}>
          Trending transitions and lived experiences from the community.
        </Text>
      </View>

      {/* Content */}
      {isLoading && !isRefreshing ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : feed.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 }}>
          <Feather name="wind" size={48} color={L.navySoft} style={{ marginBottom: 16 }} />
          <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 24, color: L.navy, textAlign: 'center', marginBottom: 8 }}>
            It's quiet here
          </Text>
          <Text style={{ fontSize: 14, color: L.navySoft, textAlign: 'center', fontFamily: 'Inter_400Regular' }}>
            No experiences have been shared yet. Be the first!
          </Text>
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            graph && graph.nodes.length > 0 ? (
              <Animated.View entering={FadeInDown.springify().damping(20)}>
                <Text style={{
                  fontFamily: 'InstrumentSerif_400Regular',
                  fontSize: 24, color: L.navy, marginBottom: 4, marginTop: 8
                }}>
                  Trending Paths
                </Text>
                <VisualGraph nodes={graph.nodes} edges={graph.edges} />
                <Text style={{
                  fontFamily: 'InstrumentSerif_400Regular',
                  fontSize: 24, color: L.navy, marginBottom: 16, marginTop: 16
                }}>
                  Recent Experiences
                </Text>
              </Animated.View>
            ) : null
          }
          renderItem={renderFeedCard}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={L.terracotta} />
          }
        />
      )}
    </View>
  );
}
