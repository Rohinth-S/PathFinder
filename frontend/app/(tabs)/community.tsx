import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
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
        style={s.userCard}
        onPress={() => router.push(`/u/${item.username || 'unknown'}`)}
      >
        <View style={s.cardHeader}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{item.username ? item.username[0].toUpperCase() : '?'}</Text>
          </View>
          <View style={s.userInfo}>
            <Text style={s.username}>@{item.username || 'unknown'}</Text>
            <View style={s.repRow}>
            <Text style={s.repStar}>⭐</Text>
            <Text style={s.repValue}>{typeof item.reputationScore === 'object' && item.reputationScore !== null ? (item.reputationScore as any).low : item.reputationScore}</Text>
            <Text style={s.expCount}> • {typeof item.experienceCount === 'object' && item.experienceCount !== null ? (item.experienceCount as any).low : item.experienceCount} experiences</Text>
          </View>
        </View>
      </View>

      {item.topics && item.topics.length > 0 && (
        <View style={s.tagsRow}>
          {item.topics.slice(0, 3).map(t => (
            <View key={`topic-${t}`} style={s.tag}>
              <Text style={s.tagText}>{t}</Text>
            </View>
          ))}
          {item.subtopics && item.subtopics.length > 0 && (
            <View key={`sub-${item.subtopics[0]}`} style={s.tagSub}>
              <Text style={s.tagTextSub}>{item.subtopics[0]}</Text>
            </View>
          )}
        </View>
      )}

      {item.latestExperience && (
        <View style={s.latestExp}>
          <Text style={s.expTitle} numberOfLines={1}>
            {item.latestExperience.title} @ {item.latestExperience.organization}
            {item.latestExperience.isVerified && <Text style={s.verifiedIcon}> ✓</Text>}
          </Text>
          <Text style={s.expSummary} numberOfLines={2}>
            {item.latestExperience.timelineSummary}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Community</Text>
      </View>

      {/* Filters */}
      <View style={s.filtersContainer}>
        {/* Topics */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
          <TouchableOpacity
            style={[s.chip, !selectedTopic && s.chipActive]}
            onPress={() => { setSelectedTopic(null); setSelectedSubtopic(null); }}
          >
            <Text style={[s.chipText, !selectedTopic && s.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {topics.map(t => (
            <TouchableOpacity
              key={`filter-topic-${t}`}
              style={[s.chip, selectedTopic === t && s.chipActive]}
              onPress={() => { setSelectedTopic(t); setSelectedSubtopic(null); }}
            >
              <Text style={[s.chipText, selectedTopic === t && s.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Subtopics */}
        {subtopics.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.subFilterScroll} contentContainerStyle={s.filterContent}>
            <TouchableOpacity
              style={[s.subChip, !selectedSubtopic && s.subChipActive]}
              onPress={() => setSelectedSubtopic(null)}
            >
              <Text style={[s.subChipText, !selectedSubtopic && s.subChipTextActive]}>Any Subtopic</Text>
            </TouchableOpacity>
            {subtopics.map(sub => (
              <TouchableOpacity
                key={`filter-sub-${sub}`}
                style={[s.subChip, selectedSubtopic === sub && s.subChipActive]}
                onPress={() => setSelectedSubtopic(sub)}
              >
                <Text style={[s.subChipText, selectedSubtopic === sub && s.subChipTextActive]}>{sub}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Users List */}
      {isLoading && !isRefreshing ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={BRAND_COLORS.teal} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) => item.username || `unknown-${index}`}
          renderItem={renderUserCard}
          contentContainerStyle={s.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={BRAND_COLORS.teal} />
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyText}>No users found for this filter.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND_COLORS.cream },
  header: { padding: 16, paddingTop: 20, backgroundColor: BRAND_COLORS.white, borderBottomWidth: 1, borderBottomColor: BRAND_COLORS.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: BRAND_COLORS.navy },

  filtersContainer: { backgroundColor: BRAND_COLORS.white, borderBottomWidth: 1, borderBottomColor: BRAND_COLORS.border },
  filterScroll: { paddingVertical: 12 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: BRAND_COLORS.cream, borderWidth: 1, borderColor: BRAND_COLORS.border },
  chipActive: { backgroundColor: BRAND_COLORS.navy, borderColor: BRAND_COLORS.navy },
  chipText: { fontSize: 14, fontWeight: '600', color: BRAND_COLORS.slate },
  chipTextActive: { color: BRAND_COLORS.white },

  subFilterScroll: { paddingBottom: 12 },
  subChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: BRAND_COLORS.white, borderWidth: 1, borderColor: BRAND_COLORS.border },
  subChipActive: { backgroundColor: BRAND_COLORS.teal, borderColor: BRAND_COLORS.teal },
  subChipText: { fontSize: 13, fontWeight: '600', color: BRAND_COLORS.slate },
  subChipTextActive: { color: BRAND_COLORS.white },

  listContent: { padding: 16, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 15, color: BRAND_COLORS.slate, textAlign: 'center' },

  userCard: { backgroundColor: BRAND_COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BRAND_COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: BRAND_COLORS.teal, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: '800', color: BRAND_COLORS.white },
  userInfo: { flex: 1 },
  username: { fontSize: 16, fontWeight: '700', color: BRAND_COLORS.navy, marginBottom: 4 },
  repRow: { flexDirection: 'row', alignItems: 'center' },
  repStar: { fontSize: 12, marginRight: 4 },
  repValue: { fontSize: 14, fontWeight: '700', color: BRAND_COLORS.teal },
  expCount: { fontSize: 12, color: BRAND_COLORS.slate },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { backgroundColor: BRAND_COLORS.cream, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '600', color: BRAND_COLORS.navy },
  tagSub: { backgroundColor: BRAND_COLORS.tan + '30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagTextSub: { fontSize: 11, fontWeight: '600', color: BRAND_COLORS.rust },

  latestExp: { backgroundColor: BRAND_COLORS.cream, padding: 12, borderRadius: 8 },
  expTitle: { fontSize: 13, fontWeight: '700', color: BRAND_COLORS.navy, marginBottom: 4 },
  verifiedIcon: { color: BRAND_COLORS.teal },
  expSummary: { fontSize: 12, color: BRAND_COLORS.slate, lineHeight: 18 },
});
