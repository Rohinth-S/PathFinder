import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { getUserJourney, JourneyExperience, JourneyTransition } from '../../api/journey.api';
import { TimelineEvent, NodeType } from '../../types/schema';
import { BRAND_COLORS } from '../../constants/colors';

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
      <View className="flex-1 bg-brand-cream justify-center items-center">
        <ActivityIndicator size="large" color={BRAND_COLORS.teal} />
        <Text className="text-sm text-brand-slate mt-3">Loading your journey...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-brand-cream justify-center items-center p-8">
        <Text className="text-[15px] text-brand-slate text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-full bg-brand-teal"
          onPress={loadJourney}
        >
          <Text className="text-sm font-semibold text-brand-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (timeline.length === 0) {
    return (
      <View className="flex-1 bg-brand-cream justify-center items-center p-8">
        <Text className="text-2xl mb-3">📝</Text>
        <Text className="text-xl font-bold text-brand-navy mb-2">No journey yet</Text>
        <Text className="text-sm text-brand-slate text-center mb-6">
          Share your career journey to build your Life Graph and help others learn from your path.
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-full bg-brand-teal"
          onPress={() => router.push('/share-journey')}
        >
          <Text className="text-sm font-semibold text-brand-white">Share Your Journey</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-brand-cream p-5">
      <Text className="text-xl font-bold text-brand-navy mb-4">My Life Graph</Text>
      {timeline.map((event, idx) => {
        const isLast = idx === timeline.length - 1;
        return (
          <TouchableOpacity
            key={event.id}
            className="flex-row mb-0 active:opacity-70"
            onPress={() => router.push({ pathname: '/journey-details', params: { eventData: JSON.stringify(event) } })}
          >
            <View className="w-6 items-center">
              <View className={`w-3.5 h-3.5 rounded-full mt-4 z-10 ${event.isVerified ? 'bg-brand-teal' : 'bg-brand-tan'}`} />
              {!isLast && <View className="w-1 flex-1 bg-brand-teal -mt-0.5" />}
            </View>
            <View className="flex-1 bg-brand-white rounded-xl p-3.5 ml-2.5 mb-3 border border-brand-border">
              <Text className="text-base font-bold text-brand-navy mb-0.5">{event.title}</Text>
              <Text className="text-xs text-brand-slate font-medium mb-1.5">{event.startDate} – {event.endDate || 'Present'}  •  {event.organization}</Text>
              <Text className="text-sm text-brand-slate leading-5" numberOfLines={2}>{event.timelineSummary}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
