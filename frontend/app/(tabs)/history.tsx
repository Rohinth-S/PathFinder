import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { getUserJourney, JourneyExperience, JourneyTransition } from '../../api/journey.api';
import { TimelineEvent, NodeType } from '../../types/schema';
import { UI } from '../../constants/colors';
import { SectionLabel, PillBadge } from '../../components/ui/SectionLabel';
import { GradientButton } from '../../components/ui/GradientButton';
import { DotDivider } from '../../components/ui/DotDivider';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown } from 'react-native-reanimated';

/**
 * Maps backend experience data to the TimelineEvent shape used by the UI.
 */
function mapExperienceToTimelineEvent(
  exp: JourneyExperience,
  transitions: JourneyTransition[]
): TimelineEvent {
  const outgoing = transitions
    .filter(t => t.fromExperienceId === exp.id)
    .map(t => ({ decisionLabel: t.decisionLabel, toExperienceId: t.toExperienceId }));

  // Infer nodeType from the experience data
  let nodeType: NodeType = 'Job';
  const titleLower = (exp.title || '').toLowerCase();
  const contextLower = (exp.context || '').toLowerCase();
  if (titleLower.includes('university') || titleLower.includes('degree') || titleLower.includes('b.tech') || titleLower.includes('education') || contextLower.includes('education')) {
    nodeType = 'Education';
  } else if (titleLower.includes('startup') || titleLower.includes('founded') || titleLower.includes('co-founded')) {
    nodeType = 'Startup';
  } else if (titleLower.includes('failed') || titleLower.includes('failure') || contextLower.includes('failed')) {
    nodeType = 'Failure';
  } else if (titleLower.includes('decision') || titleLower.includes('left') || titleLower.includes('pivoted')) {
    nodeType = 'Decision';
  } else if (titleLower.includes('achievement') || titleLower.includes('milestone') || titleLower.includes('revenue') || titleLower.includes('pmf')) {
    nodeType = 'Achievement';
  }

  return {
    id: exp.id,
    title: exp.title,
    startDate: exp.startDate,
    endDate: exp.endDate,
    organization: exp.organization || '',
    isVerified: exp.isVerified,
    nodeType,
    emotionLabel: 'Confident',
    timelineSummary: exp.timelineSummary || exp.context || '',
    expandedDetails: {
      context: exp.context,
      challengeFaced: exp.challengeFaced,
      outcome: exp.outcome,
      achievements: exp.achievements,
      applicationStatus: exp.applicationStatus,
      emotionNote: null,
      goals: [],
      skills: exp.skills?.map(s => s.name) || [],
      transitions: outgoing,
    },
  };
}

const NODE_EMOJIS: Record<NodeType, string> = {
  Education: '🎓',
  Job: '💼',
  Decision: '◆',
  Failure: '⚡',
  Startup: '🚀',
  Achievement: '⭐',
};

export default function HistoryPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJourney();
  }, []);

  const loadJourney = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const result = await getUserJourney(token);

      if (!result.experiences || result.experiences.length === 0) {
        setTimeline([]);
      } else {
        const events = result.experiences.map(exp =>
          mapExperienceToTimelineEvent(exp, result.transitions)
        );
        setTimeline(events);
      }
    } catch (err: any) {
      console.warn("Failed to load journey:", err);
      setError(err?.message || "Failed to load your journey");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: UI.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={UI.accent} />
        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: UI.fg40, marginTop: 12 }}>Loading your journey...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: UI.background, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 15, color: UI.fg50, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
        <GradientButton label="Retry" onPress={loadJourney} size="sm" />
      </View>
    );
  }

  if (timeline.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: UI.background, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
        <Text style={{
          fontFamily: 'InstrumentSerif_400Regular',
          fontSize: 28, color: UI.foreground, marginBottom: 8,
        }}>
          No journey yet
        </Text>
        <Text style={{
          fontFamily: 'Manrope_400Regular', fontSize: 14, color: UI.fg50,
          textAlign: 'center', lineHeight: 22, marginBottom: 24,
        }}>
          Share your career journey to build your Life Graph and help others learn from your path.
        </Text>
        <GradientButton
          label="Share Your Journey"
          onPress={() => router.push('/share-journey')}
          icon="edit-3"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: UI.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 }}>
        <SectionLabel>Your Story</SectionLabel>
        <Text style={{
          fontFamily: 'InstrumentSerif_400Regular',
          fontSize: 32, color: UI.foreground, marginTop: 4,
        }}>
          Life Graph
        </Text>
      </View>

      <DotDivider style={{ marginHorizontal: 24, marginBottom: 8 }} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {timeline.map((event, idx) => {
          const isLast = idx === timeline.length - 1;
          const emoji = NODE_EMOJIS[event.nodeType || 'Job'] || '💼';

          return (
            <Animated.View
              key={event.id}
              entering={FadeInDown.delay(idx * 80).springify().damping(20)}
            >
              <TouchableOpacity
                style={{ flexDirection: 'row', marginBottom: 0 }}
                activeOpacity={0.7}
                onPress={() => router.push({ pathname: '/journey-details', params: { eventData: JSON.stringify(event) } })}
              >
                {/* Timeline rail */}
                <View style={{ width: 28, alignItems: 'center' }}>
                  {/* Node dot */}
                  <View style={{
                    width: 28, height: 28, borderRadius: 14, marginTop: 16,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: UI.accentSoft,
                    borderWidth: 1.5,
                    borderColor: event.isVerified ? UI.success : UI.fg20,
                    zIndex: 2,
                  }}>
                    <Text style={{ fontSize: 12 }}>{emoji}</Text>
                  </View>
                  {/* Vertical line */}
                  {!isLast && (
                    <View style={{
                      width: 2, flex: 1, marginTop: -2,
                      backgroundColor: UI.fg08,
                    }} />
                  )}
                </View>

                {/* Card */}
                <View style={{
                  flex: 1, marginLeft: 12, marginBottom: 12,
                  backgroundColor: UI.surface, borderRadius: 12,
                  padding: 14, borderWidth: 1, borderColor: UI.fg08,
                  borderLeftWidth: 3, borderLeftColor: UI.accent,
                }}>
                  <Text style={{
                    fontFamily: 'Manrope_700Bold', fontSize: 15,
                    color: UI.foreground, marginBottom: 2,
                  }}>
                    {event.title}
                  </Text>
                  <Text style={{
                    fontFamily: 'Manrope_600SemiBold', fontSize: 11,
                    color: UI.fg40, letterSpacing: 0.5, marginBottom: 6,
                  }}>
                    {event.startDate} – {event.endDate || 'Present'}  •  {event.organization}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Manrope_400Regular', fontSize: 13,
                      color: UI.fg50, lineHeight: 19,
                    }}
                    numberOfLines={2}
                  >
                    {event.timelineSummary}
                  </Text>
                  {event.isVerified && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: UI.success }} />
                      <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 9, color: UI.success, letterSpacing: 1, textTransform: 'uppercase' }}>
                        Verified
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}
