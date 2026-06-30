import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, ScrollView, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { BRAND_COLORS } from '../../constants/colors';
import {
  getTopics, getSubtopics, searchCommunity, SearchCommunityUser
} from '../../api/community.api';

export default function CommunityPage() {
  const router = useRouter();

  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);

  const [users, setUsers] = useState<SearchCommunityUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      fetchSubtopics(selectedTopic);
    } else {
      setSubtopics([]);
      setSelectedSubtopic(null);
    }
  }, [selectedTopic]);

  useEffect(() => {
    fetchUsers();
  }, [selectedTopic, selectedSubtopic]);

  const fetchTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchSubtopics = async (topic: string) => {
    try {
      const data = await getSubtopics(topic);
      setSubtopics(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await searchCommunity({
        topic: selectedTopic || undefined,
        subtopic: selectedSubtopic || undefined,
        limit: 50,
      });
      setUsers(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
    if (selectedTopic) fetchSubtopics(selectedTopic);
    else fetchTopics();
  };

  const renderUserCard = ({ item }: { item: SearchCommunityUser }) => (
      <TouchableOpacity
        className="bg-brand-white rounded-2xl p-4 border border-brand-border elevation-2 shadow-sm mb-4"
        onPress={() => router.push(`/u/${item.username || 'unknown'}`)}
      >
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 rounded-full bg-brand-teal justify-center items-center mr-3">
            <Text className="text-[20px] font-extrabold text-brand-white">{item.username ? item.username[0].toUpperCase() : '?'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-brand-navy mb-1">@{item.username || 'unknown'}</Text>
            <View className="flex-row items-center">
            <Text className="text-xs mr-1">⭐</Text>
            <Text className="text-sm font-bold text-brand-teal">{typeof item.reputationScore === 'object' && item.reputationScore !== null ? (item.reputationScore as any).low : item.reputationScore}</Text>
            <Text className="text-xs text-brand-slate"> • {typeof item.experienceCount === 'object' && item.experienceCount !== null ? (item.experienceCount as any).low : item.experienceCount} experiences</Text>
          </View>
        </View>
      </View>

      {item.topics && item.topics.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mb-3">
          {item.topics.slice(0, 3).map(t => (
            <View key={`topic-${t}`} className="bg-brand-cream px-2 py-1 rounded-md">
              <Text className="text-[11px] font-semibold text-brand-navy">{t}</Text>
            </View>
          ))}
          {item.subtopics && item.subtopics.length > 0 && (
            <View key={`sub-${item.subtopics[0]}`} className="px-2 py-1 rounded-md" style={{ backgroundColor: BRAND_COLORS.tan + '30' }}>
              <Text className="text-[11px] font-semibold text-brand-rust">{item.subtopics[0]}</Text>
            </View>
          )}
        </View>
      )}

      {item.latestExperience && (
        <View className="bg-brand-cream p-3 rounded-lg">
          <Text className="text-[13px] font-bold text-brand-navy mb-1" numberOfLines={1}>
            {item.latestExperience.title} @ {item.latestExperience.organization}
            {item.latestExperience.isVerified && <Text className="text-brand-teal"> ✓</Text>}
          </Text>
          <Text className="text-xs text-brand-slate leading-[18px]" numberOfLines={2}>
            {item.latestExperience.timelineSummary}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-brand-cream">
      {/* Header */}
      <View className="p-4 pt-5 bg-brand-white border-b border-brand-border">
        <Text className="text-2xl font-extrabold text-brand-navy">Community</Text>
      </View>

      {/* Filters */}
      <View className="bg-brand-white border-b border-brand-border">
        {/* Topics */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-3" contentContainerClassName="px-4 gap-2">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${!selectedTopic ? 'bg-brand-navy border-brand-navy' : 'bg-brand-cream border-brand-border'}`}
            onPress={() => { setSelectedTopic(null); setSelectedSubtopic(null); }}
          >
            <Text className={`text-sm font-semibold ${!selectedTopic ? 'text-brand-white' : 'text-brand-slate'}`}>All</Text>
          </TouchableOpacity>
          {topics.map(t => (
            <TouchableOpacity
              key={`filter-topic-${t}`}
              className={`px-4 py-2 rounded-full border ${selectedTopic === t ? 'bg-brand-navy border-brand-navy' : 'bg-brand-cream border-brand-border'}`}
              onPress={() => { setSelectedTopic(t); setSelectedSubtopic(null); }}
            >
              <Text className={`text-sm font-semibold ${selectedTopic === t ? 'text-brand-white' : 'text-brand-slate'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Subtopics */}
        {subtopics.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-3" contentContainerClassName="px-4 gap-2">
            <TouchableOpacity
              className={`px-3.5 py-1.5 rounded-2xl border ${!selectedSubtopic ? 'bg-brand-teal border-brand-teal' : 'bg-brand-white border-brand-border'}`}
              onPress={() => setSelectedSubtopic(null)}
            >
              <Text className={`text-[13px] font-semibold ${!selectedSubtopic ? 'text-brand-white' : 'text-brand-slate'}`}>Any Subtopic</Text>
            </TouchableOpacity>
            {subtopics.map(sub => (
              <TouchableOpacity
                key={`filter-sub-${sub}`}
                className={`px-3.5 py-1.5 rounded-2xl border ${selectedSubtopic === sub ? 'bg-brand-teal border-brand-teal' : 'bg-brand-white border-brand-border'}`}
                onPress={() => setSelectedSubtopic(sub)}
              >
                <Text className={`text-[13px] font-semibold ${selectedSubtopic === sub ? 'text-brand-white' : 'text-brand-slate'}`}>{sub}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Users List */}
      {isLoading && !isRefreshing ? (
        <View className="flex-1 justify-center items-center p-8">
          <ActivityIndicator size="large" color={BRAND_COLORS.teal} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) => item.username || `unknown-${index}`}
          renderItem={renderUserCard}
          contentContainerClassName="p-4"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={BRAND_COLORS.teal} />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-8">
              <Text className="text-[15px] text-brand-slate text-center">No users found for this filter.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}


