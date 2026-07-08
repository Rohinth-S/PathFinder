import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  ActivityIndicator, RefreshControl, Modal, Pressable, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
  Easing, interpolateColor, runOnJS,
} from 'react-native-reanimated';
import { L } from '../../constants/colors';
import {
  getTopics, getSubtopics, searchCommunity, SearchCommunityUser,
} from '../../api/community.api';

// ═══════════════════════════════════════════════════════
//  Bottom-sheet picker (shared with Profile language selector pattern)
// ═══════════════════════════════════════════════════════

type PickerProps = {
  visible: boolean;
  title: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
};

function BottomSheetPicker({ visible, title, options, selected, onSelect, onClose }: PickerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(21,34,56,0.35)' }} onPress={onClose}>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: L.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            maxHeight: '60%',
          }}
        >
          {/* Handle bar */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: L.border, alignSelf: 'center', marginBottom: 16 }} />

          {/* Title */}
          <Text style={{ fontSize: 17, fontWeight: '700', color: L.navy, paddingHorizontal: 24, marginBottom: 16, fontFamily: 'Manrope_700Bold' }}>
            {title}
          </Text>

          {/* Options */}
          <ScrollView style={{ paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const isSelected = selected === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => onSelect(opt)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
                    backgroundColor: isSelected ? L.tealTint : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 15, color: L.navy, fontWeight: isSelected ? '600' : '400',
                    fontFamily: isSelected ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
                  }}>
                    {opt}
                  </Text>
                  {isSelected && (
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: L.teal, alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="check" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
//  Animated filter trigger (with unlock flash)
// ═══════════════════════════════════════════════════════

type FilterTriggerProps = {
  label: string;
  value: string | null;
  disabled?: boolean;
  onPress: () => void;
};

function FilterTrigger({ label, value, disabled, onPress }: FilterTriggerProps) {
  const flashProgress = useSharedValue(0);
  const prevDisabled = useRef(disabled);

  useEffect(() => {
    // Flash animation when transitioning from disabled to enabled
    if (prevDisabled.current && !disabled) {
      flashProgress.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }),
      );
    }
    prevDisabled.current = disabled;
  }, [disabled, flashProgress]);

  const flashStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(flashProgress.value, [0, 1], ['transparent', L.tealTint]),
  }));

  const borderColor = disabled ? L.border : (value ? L.teal : `${L.teal}4D`); // 4D = 30% opacity
  const bgColor = disabled ? L.background : (value ? L.tealTint : L.surface);
  const textColor = disabled ? `${L.navySoft}66` : (value ? L.navy : L.navySoft); // 66 = 40%
  const chevronColor = disabled ? `${L.navySoft}4D` : L.teal; // 4D = 30%

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          flashStyle,
          {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: bgColor, borderWidth: 1, borderColor,
            borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, gap: 6,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={{
            flex: 1, fontSize: 14, fontWeight: value ? '500' : '400', color: textColor,
            fontFamily: value ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
          }}
        >
          {value || label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {disabled && (
            <Feather name="lock" size={10} color={`${L.navySoft}4D`} />
          )}
          <Feather name="chevron-down" size={14} color={chevronColor} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════
//  User Card
// ═══════════════════════════════════════════════════════

function UserCard({ user, onViewJourney }: { user: SearchCommunityUser; onViewJourney: () => void }) {
  const initial = (user.username || '?')[0].toUpperCase();

  // Parse reputation score (handle neo4j integer objects)
  const repScore = typeof user.reputationScore === 'object' && user.reputationScore !== null
    ? (user.reputationScore as any).low
    : user.reputationScore;
  const hasReputation = repScore != null && repScore > 0;

  // Parse experience count
  const expCount = typeof user.experienceCount === 'object' && user.experienceCount !== null
    ? (user.experienceCount as any).low
    : user.experienceCount;

  // Build a one-line AI summary from available data
  const summary = user.latestExperience
    ? `${user.latestExperience.timelineSummary}`
    : (user.topics?.length > 0 ? `Focused on ${user.topics.join(', ')}.` : 'Exploring new paths.');

  return (
    <View style={{
      backgroundColor: L.surface, borderRadius: 20, borderWidth: 1, borderColor: `${L.teal}33`,
      paddingHorizontal: 16, paddingVertical: 16, marginBottom: 16,
    }}>
      {/* Header: avatar + username + reputation */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Avatar circle */}
          <View style={{
            width: 40, height: 40, borderRadius: 20, backgroundColor: L.tealTint,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: L.teal, fontFamily: 'Manrope_700Bold' }}>{initial}</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: L.navy, fontFamily: 'Manrope_700Bold' }}>@{user.username || 'unknown'}</Text>
        </View>

        {/* Reputation badge */}
        {hasReputation && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            backgroundColor: L.terracottaTint, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 11, color: L.terracotta }}>★</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: L.terracotta, fontFamily: 'Manrope_700Bold' }}>{repScore}</Text>
          </View>
        )}
      </View>

      {/* AI Summary */}
      <Text
        numberOfLines={2}
        style={{ fontSize: 14, color: L.navy, lineHeight: 20, marginBottom: 12, fontFamily: 'Manrope_400Regular' }}
      >
        {summary}
      </Text>

      {/* Expertise Areas */}
      {user.topics && user.topics.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: L.teal, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Manrope_600SemiBold' }}>
            EXPERTISE AREAS
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {user.topics.map((topic) => (
              <View key={topic} style={{ backgroundColor: L.tealTint, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: L.teal, fontFamily: 'Manrope_600SemiBold' }}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Goals Matching Your Search */}
      {user.subtopics && user.subtopics.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Feather name="target" size={14} color={L.teal} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: L.teal, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Manrope_600SemiBold' }}>
              GOALS MATCHING YOUR SEARCH
            </Text>
            {/* Terracotta count pill */}
            <View style={{ backgroundColor: L.terracottaTint, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 2, marginLeft: 'auto' }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: L.terracotta, fontFamily: 'Manrope_600SemiBold' }}>
                {user.subtopics.length} Goals Matched
              </Text>
            </View>
          </View>
          {user.subtopics.slice(0, 3).map((goal, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6, paddingLeft: 4 }}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.5, borderColor: L.teal, marginTop: 5 }} />
              <Text style={{ fontSize: 13, fontWeight: '500', color: L.navy, flex: 1, fontFamily: 'Manrope_600SemiBold' }}>{goal}</Text>
            </View>
          ))}
          {user.subtopics.length > 3 && (
            <Text style={{ fontSize: 12, color: L.navySoft, paddingLeft: 21, fontFamily: 'Manrope_400Regular' }}>
              +{user.subtopics.length - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Journey Highlights */}
      {user.latestExperience && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <MaterialCommunityIcons name="star-four-points" size={14} color={L.teal} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: L.teal, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Manrope_600SemiBold' }}>
              JOURNEY HIGHLIGHTS
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 4, paddingLeft: 4 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: L.teal, marginTop: 5 }} />
            <Text style={{ fontSize: 13, fontWeight: '500', color: L.navy, flex: 1, fontFamily: 'Manrope_600SemiBold' }}>
              {user.latestExperience.title}
              {user.latestExperience.organization ? ` at ${user.latestExperience.organization}` : ''}
            </Text>
          </View>
        </View>
      )}

      {/* View Full Journey button */}
      <TouchableOpacity
        onPress={onViewJourney}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          borderWidth: 1, borderColor: L.teal, borderRadius: 28, paddingVertical: 14,
          backgroundColor: L.surface,
        }}
      >
        <MaterialCommunityIcons name="map-marker-path" size={18} color={L.teal} />
        <Text style={{ fontSize: 14, fontWeight: '600', color: L.teal, fontFamily: 'Manrope_600SemiBold' }}>View Full Journey</Text>
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
//  Skeleton loader
// ═══════════════════════════════════════════════════════

function SkeletonCard() {
  return (
    <View style={{
      backgroundColor: `${L.tealTint}66`, borderRadius: 20, height: 200, marginBottom: 16,
    }} />
  );
}

// ═══════════════════════════════════════════════════════
//  Main Community Page
// ═══════════════════════════════════════════════════════

export default function CommunityPage() {
  const router = useRouter();

  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);

  const [users, setUsers] = useState<SearchCommunityUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [topicPickerVisible, setTopicPickerVisible] = useState(false);
  const [subtopicPickerVisible, setSubtopicPickerVisible] = useState(false);

  // Fetch topics on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  // Fetch subtopics when topic changes
  useEffect(() => {
    if (selectedTopic) {
      fetchSubtopics(selectedTopic);
    } else {
      setSubtopics([]);
      setSelectedSubtopic(null);
    }
  }, [selectedTopic]);

  // Auto-search on filter change
  useEffect(() => {
    fetchUsers();
  }, [selectedTopic, selectedSubtopic]);

  const fetchTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (e) {
      console.warn('Failed to fetch topics:', e);
    }
  };

  const fetchSubtopics = async (topic: string) => {
    try {
      const data = await getSubtopics(topic);
      setSubtopics(data);
    } catch (e) {
      console.warn('Failed to fetch subtopics:', e);
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
    } catch (e: any) {
      console.warn('Failed to fetch users:', e);
      setUsers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchUsers();
    if (selectedTopic) fetchSubtopics(selectedTopic);
    else fetchTopics();
  }, [selectedTopic]);

  const handleTopicSelect = (topic: string) => {
    if (selectedTopic === topic) {
      // Deselect
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topic);
      setSelectedSubtopic(null); // Clear subtopic when topic changes
    }
    setTopicPickerVisible(false);
  };

  const handleSubtopicSelect = (subtopic: string) => {
    setSelectedSubtopic(selectedSubtopic === subtopic ? null : subtopic);
    setSubtopicPickerVisible(false);
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const renderUserCard = useCallback(({ item }: { item: SearchCommunityUser }) => (
    <UserCard
      user={item}
      onViewJourney={() => router.push(`/u/${item.username || 'unknown'}`)}
    />
  ), [router]);

  const isSearchEnabled = selectedTopic != null;

  return (
    <View style={{ flex: 1, backgroundColor: L.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: `${L.teal}26` }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: L.navy, fontFamily: 'Manrope_700Bold' }}>Community</Text>
        <Text style={{ fontSize: 14, color: L.navySoft, marginTop: 4, fontFamily: 'Manrope_400Regular' }}>
          Discover journeys from people pursuing similar goals.
        </Text>
      </View>

      {/* Filters */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, marginTop: 20, marginBottom: 24 }}>
        <FilterTrigger
          label="Topic"
          value={selectedTopic}
          onPress={() => setTopicPickerVisible(true)}
        />
        <FilterTrigger
          label="Subtopic"
          value={selectedSubtopic}
          disabled={!selectedTopic}
          onPress={() => setSubtopicPickerVisible(true)}
        />
        {/* Search button — terracotta */}
        <TouchableOpacity
          onPress={handleSearch}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: isSearchEnabled ? L.terracotta : `${L.terracotta}59`,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Feather name="search" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Results header */}
      {!isLoading && users.length > 0 && (
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: L.navySoft, fontFamily: 'Manrope_600SemiBold' }}>
            {users.length} {users.length === 1 ? 'journey' : 'journeys'} found
          </Text>
        </View>
      )}

      {/* Content */}
      {isLoading && !isRefreshing ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : users.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: L.tealTint, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Feather name="compass" size={28} color={L.teal} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: L.navy, textAlign: 'center', marginBottom: 8, fontFamily: 'Manrope_600SemiBold' }}>
            No journeys match yet
          </Text>
          <Text style={{ fontSize: 14, color: L.navySoft, textAlign: 'center', fontFamily: 'Manrope_400Regular' }}>
            Try a different topic or subtopic.
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) => item.username || `user-${index}`}
          renderItem={renderUserCard}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={L.teal} />
          }
        />
      )}

      {/* Bottom sheet pickers */}
      <BottomSheetPicker
        visible={topicPickerVisible}
        title="Select Topic"
        options={topics}
        selected={selectedTopic}
        onSelect={handleTopicSelect}
        onClose={() => setTopicPickerVisible(false)}
      />
      <BottomSheetPicker
        visible={subtopicPickerVisible}
        title={selectedTopic ? `Subtopics for ${selectedTopic}` : 'Select Subtopic'}
        options={subtopics}
        selected={selectedSubtopic}
        onSelect={handleSubtopicSelect}
        onClose={() => setSubtopicPickerVisible(false)}
      />
    </View>
  );
}
