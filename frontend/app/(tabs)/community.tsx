import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  ActivityIndicator, RefreshControl, Modal, Pressable, Platform, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
  Easing, interpolateColor, FadeInDown,
} from 'react-native-reanimated';
import { UI } from '../../constants/colors';
import {
  getTopics, getSubtopics, searchCommunity, SearchCommunityUser,
} from '../../api/community.api';
import { SectionLabel, PillBadge } from '../../components/ui/SectionLabel';
import { DotDivider } from '../../components/ui/DotDivider';

// ═══════════════════════════════════════════════════════
//  Bottom-sheet picker
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
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(10, 15, 29, 0.5)' }} onPress={onClose}>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: UI.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            maxHeight: '60%',
          }}
        >
          {/* Handle bar */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: UI.fg20, alignSelf: 'center', marginBottom: 16 }} />

          {/* Title */}
          <Text style={{ fontSize: 18, color: UI.foreground, paddingHorizontal: 24, marginBottom: 16, fontFamily: 'InstrumentSerif_400Regular' }}>
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
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4,
                    backgroundColor: isSelected ? UI.accentSoft : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 15, color: isSelected ? UI.accent : UI.foreground,
                    fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  }}>
                    {opt}
                  </Text>
                  {isSelected && (
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: UI.accent, alignItems: 'center', justifyContent: 'center' }}>
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
//  Animated filter trigger
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
    if (prevDisabled.current && !disabled) {
      flashProgress.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }),
      );
    }
    prevDisabled.current = disabled;
  }, [disabled, flashProgress]);

  const flashStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(flashProgress.value, [0, 1], ['transparent', UI.accentSoft]),
  }));

  const borderColor = disabled ? UI.fg08 : (value ? UI.accentTint : UI.fg20);
  const bgColor = disabled ? UI.background : (value ? UI.accentSoft : UI.surface);
  const textColor = disabled ? UI.fg40 : (value ? UI.foreground : UI.fg50);
  const chevronColor = disabled ? UI.fg40 : UI.fg80;

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
            flex: 1, fontSize: 13, color: textColor,
            fontFamily: value ? 'Inter_600SemiBold' : 'Inter_400Regular',
          }}
        >
          {value || label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {disabled && (
            <Feather name="lock" size={10} color={UI.fg40} />
          )}
          <Feather name="chevron-down" size={14} color={chevronColor} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════
//  User Card — fully redesigned with summary, expertise, highlights
// ═══════════════════════════════════════════════════════

function UserCard({ user, onViewJourney }: { user: SearchCommunityUser; onViewJourney: () => void }) {
  const initial = (user.username || '?')[0].toUpperCase();

  // Parse reputation score (handle neo4j integer objects)
  const repScore = typeof user.reputationScore === 'object' && user.reputationScore !== null
    ? (user.reputationScore as any).low
    : user.reputationScore;
  const hasReputation = repScore != null && repScore > 0;

  const summary = user.summary || 'Exploring new paths on PathFinder.';
  const expertiseAreas = user.expertiseAreas || [];
  const matchingGoals = user.matchingGoalTitles || [];
  const matchingGoalCount = typeof user.matchingGoalCount === 'object'
    ? (user.matchingGoalCount as any).low
    : (user.matchingGoalCount || 0);
  const journeyHighlights = user.journeyHighlights || [];

  return (
    <View style={{
      backgroundColor: UI.surface, borderRadius: 20, borderWidth: 1, borderColor: UI.fg08,
      paddingHorizontal: 20, paddingVertical: 20, marginBottom: 16,
    }}>
      {/* Header: avatar + username + reputation */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Avatar circle */}
          <View style={{
            width: 42, height: 42, borderRadius: 21, backgroundColor: UI.surfaceInverse,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 17, color: '#FFFFFF', fontFamily: 'Inter_700Bold' }}>{initial}</Text>
          </View>
          <Text style={{ fontSize: 15, color: UI.foreground, fontFamily: 'Inter_700Bold' }}>@{user.username || 'unknown'}</Text>
        </View>

        {/* Reputation badge */}
        {hasReputation && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            backgroundColor: UI.accentSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 11, color: UI.accent }}>★</Text>
            <Text style={{ fontSize: 12, color: UI.accent, fontFamily: 'Inter_700Bold' }}>{repScore}</Text>
          </View>
        )}
      </View>

      {/* Summary */}
      <Text
        numberOfLines={3}
        style={{ fontSize: 14, color: UI.fg80, lineHeight: 22, marginBottom: 16, fontFamily: 'Inter_400Regular' }}
      >
        {summary}
      </Text>

      {/* Expertise Areas */}
      {expertiseAreas.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <SectionLabel style={{ marginBottom: 8 }}>EXPERTISE AREAS</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {expertiseAreas.map((area) => (
              <View key={area} style={{
                paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
                backgroundColor: UI.accentSoft,
              }}>
                <Text style={{ fontSize: 12, color: UI.accent, fontFamily: 'Inter_600SemiBold' }}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Goals Matching Your Search */}
      {matchingGoals.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionLabel>GOALS MATCHING YOUR SEARCH</SectionLabel>
            <View style={{
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
              backgroundColor: UI.accentSoft,
            }}>
              <Text style={{ fontSize: 10, color: UI.accent, fontFamily: 'Inter_700Bold' }}>
                {matchingGoalCount} {matchingGoalCount === 1 ? 'Goal' : 'Goals'} Matched
              </Text>
            </View>
          </View>
          {matchingGoals.slice(0, 3).map((goal, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: UI.accent, marginTop: 7 }} />
              <Text style={{ fontSize: 14, color: UI.fg80, flex: 1, lineHeight: 20, fontFamily: 'Inter_400Regular' }}>{goal}</Text>
            </View>
          ))}
          {matchingGoalCount > 3 && (
            <Text style={{ fontSize: 13, color: UI.fg50, fontFamily: 'Inter_600SemiBold', marginTop: 2 }}>
              +{matchingGoalCount - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Journey Highlights */}
      {journeyHighlights.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <SectionLabel color={UI.accent} style={{ marginBottom: 10 }}>JOURNEY HIGHLIGHTS</SectionLabel>
          {journeyHighlights.map((highlight, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: UI.fg40, marginTop: 7 }} />
              <Text style={{ fontSize: 14, color: UI.fg80, flex: 1, lineHeight: 20, fontFamily: 'Inter_400Regular' }}>{highlight}</Text>
            </View>
          ))}
        </View>
      )}

      {/* View Full Journey Button */}
      <TouchableOpacity
        onPress={onViewJourney}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          paddingVertical: 14, borderRadius: 9999,
          borderWidth: 1.5, borderColor: UI.fg20,
          marginTop: 4,
        }}
      >
        <Feather name="map" size={16} color={UI.foreground} />
        <Text style={{ fontSize: 14, color: UI.foreground, fontFamily: 'Inter_600SemiBold' }}>
          View Full Journey
        </Text>
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
      backgroundColor: UI.surfaceDim, borderRadius: 20, height: 240, marginBottom: 16,
      opacity: 0.5,
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
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topic);
      setSelectedSubtopic(null);
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

  const renderUserCard = useCallback(({ item, index }: { item: SearchCommunityUser; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(20)}>
      <UserCard
        user={item}
        onViewJourney={() => router.push(`/u/${item.username || 'unknown'}`)}
      />
    </Animated.View>
  ), [router]);

  const isSearchEnabled = selectedTopic != null;

  return (
    <View style={{ flex: 1, backgroundColor: UI.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 }}>
        <Text style={{
          fontFamily: 'InstrumentSerif_400Regular',
          fontSize: 32, color: UI.foreground, marginBottom: 4,
        }}>
          Community
        </Text>
        <Text style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 14, color: UI.fg50, lineHeight: 20,
        }}>
          Discover journeys from people pursuing similar goals.
        </Text>
      </View>

      {/* Filters */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, marginTop: 16, marginBottom: 24 }}>
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
        {/* Search button */}
        <TouchableOpacity
          onPress={handleSearch}
          disabled={!isSearchEnabled}
          activeOpacity={0.7}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: isSearchEnabled ? UI.accent : UI.fg08,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Feather name="search" size={18} color={isSearchEnabled ? '#FFFFFF' : UI.fg40} />
        </TouchableOpacity>
      </View>

      {/* Results header */}
      {!isLoading && users.length > 0 && (
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <SectionLabel>
            {`${users.length} ${users.length === 1 ? 'JOURNEY' : 'JOURNEYS'} FOUND`}
          </SectionLabel>
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
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🌱</Text>
          <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 24, color: UI.foreground, textAlign: 'center', marginBottom: 8 }}>
            No journeys match yet
          </Text>
          <Text style={{ fontSize: 14, color: UI.fg50, textAlign: 'center', fontFamily: 'Inter_400Regular' }}>
            Try exploring a different topic or subtopic.
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
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={UI.accent} />
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
