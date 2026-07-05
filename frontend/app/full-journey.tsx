import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Switch, Modal, Pressable, Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { getUserJourney, JourneyExperience, JourneyTransition } from '../api/journey.api';
import { UserTrajectory, TimelineEvent, NodeType } from '@/types/schema';
import { NODE_BORDER_COLORS, NODE_ICONS, getEmotionStyle } from '@/constants/colors';
import { BRAND_COLORS } from '../constants/colors';

/* ── Map backend data to UI format ─────────────────────── */

function mapToUserTrajectory(
  journey: {
    user: any;
    experiences: JourneyExperience[];
    transitions: JourneyTransition[];
  }
): UserTrajectory {
  const timeline: TimelineEvent[] = journey.experiences.map(exp => {
    const outgoing = journey.transitions
      .filter(t => t.fromExperienceId === exp.id)
      .map(t => ({ decisionLabel: t.decisionLabel, toExperienceId: t.toExperienceId }));

    let nodeType: NodeType = 'Job';
    const titleLower = (exp.title || '').toLowerCase();
    const contextLower = (exp.context || '').toLowerCase();
    if (titleLower.includes('university') || titleLower.includes('degree') || titleLower.includes('education') || contextLower.includes('education')) {
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
  });

  return {
    username: journey.user?.username || '',
    reputationScore: typeof journey.user?.reputationScore === 'object'
      ? (journey.user.reputationScore as any)?.low ?? 0
      : journey.user?.reputationScore ?? 0,
    timeline,
  };
}

/* ── Component ─────────────────────────────────────────── */

export default function FullJourneyPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const params = useLocalSearchParams<{ userData?: string }>();
  const [showRelevant, setShowRelevant] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TimelineEvent | null>(null);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserTrajectory | null>(null);

  useEffect(() => {
    if (params.userData) {
      try {
        const parsed = JSON.parse(params.userData);
        setUser(parsed);
        setIsLoading(false);
        return;
      } catch { /* fall through to API fetch */ }
    }
    loadJourney();
  }, []);

  const loadJourney = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const result = await getUserJourney(token);
      if (!result.journey || result.journey.experiences.length === 0) {
        setUser(null);
      } else {
        setUser(mapToUserTrajectory(result.journey));
      }
    } catch (err: any) {
      console.warn("Failed to load journey:", err);
      setError(err?.message || "Failed to load journey");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-cream justify-center items-center">
        <ActivityIndicator size="large" color={BRAND_COLORS.teal} />
        <Text className="text-sm text-brand-slate mt-3">Loading journey...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-brand-cream justify-center items-center p-8">
        <Text className="text-[15px] text-brand-slate text-center mb-4">{error}</Text>
        <TouchableOpacity className="px-6 py-3 rounded-full bg-brand-teal" onPress={loadJourney}>
          <Text className="text-sm font-semibold text-brand-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user || user.timeline.length === 0) {
    return (
      <View className="flex-1 bg-brand-cream justify-center items-center p-8">
        <Text className="text-2xl mb-3">🗺️</Text>
        <Text className="text-xl font-bold text-brand-navy mb-2">No journey data</Text>
        <Text className="text-sm text-brand-slate text-center mb-6">
          Share your journey first to see your full career flowchart here.
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-full bg-brand-teal"
          onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)'); }}
        >
          <Text className="text-sm font-semibold text-brand-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Separate failure nodes for branching
  const mainTimeline = user.timeline.filter(e => e.nodeType !== 'Failure');
  const failureNodes = user.timeline.filter(e => e.nodeType === 'Failure');

  // Find the index after which the failure branches off
  const failureBranchAfterIdx = mainTimeline.findIndex(e =>
    e.nodeType === 'Decision' && e.expandedDetails.transitions.length > 0
  );

  return (
    <View className="flex-1 bg-brand-cream">
      {/* Header */}
      <View className="flex-row items-start p-4 pt-5 gap-3 border-b border-brand-border">
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }}><Text className="text-2xl text-brand-navy mt-0.5">←</Text></TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-brand-navy">Full Journey</Text>
          <Text className="text-[13px] text-brand-slate mt-0.5">{user.timeline.length} experiences</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-[11px] text-brand-slate font-semibold">Show relevant only</Text>
          <Switch value={showRelevant} onValueChange={setShowRelevant} trackColor={{ false: BRAND_COLORS.border, true: BRAND_COLORS.teal }} thumbColor={BRAND_COLORS.white} style={{ transform: [{ scale: 0.7 }] }} />
        </View>
      </View>

      {/* Flowchart */}
      <ScrollView className="flex-1" contentContainerClassName="p-5 pb-20 items-center">
        <Animated.View style={{ transform: [{ scale }] }}>
          {mainTimeline.map((event, idx) => {
            const isLast = idx === mainTimeline.length - 1;
            const borderColor = NODE_BORDER_COLORS[event.nodeType || 'Job'] || '#94A3B8';
            const emotionStyle = getEmotionStyle(event.emotionLabel || 'Confident');
            const faded = showRelevant && (event.nodeType === 'Education' || (event.nodeType === 'Job' && idx === 0));
            const hasBranch = idx === failureBranchAfterIdx + 1 && failureNodes.length > 0;

            return (
              <View key={event.id} style={{ opacity: faded ? 0.35 : 1 }}>
                {/* Edge label */}
                {idx > 0 && (
                  <View className="items-center my-1 gap-1">
                    <View className="w-[2px] h-5 border-l-2 border-dashed border-brand-border" />
                    <Text className="text-xs text-brand-slate bg-brand-cream px-2 font-medium">
                      {event.nodeType === 'Failure' ? 'despite' : idx === mainTimeline.length - 1 ? 'led to' : event.expandedDetails.transitions.length > 0 ? 'led to' : 'caused'}
                    </Text>
                    <View className="w-[2px] h-5 border-l-2 border-dashed border-brand-border" />
                  </View>
                )}

                {/* Row: main node + optional branch */}
                <View className="flex-row gap-3 items-start">
                  {/* Main node */}
                  <TouchableOpacity
                    className="bg-brand-white rounded-xl p-4 border-2 w-[200px] items-center"
                    style={{ borderColor }}
                    onPress={() => setSelectedNode(event)}
                    activeOpacity={0.8}
                  >
                    <Text className="text-xs font-semibold mb-0.5" style={{ color: borderColor }}>{event.nodeType}</Text>
                    {event.nodeType === 'Decision' && <Text className="text-[20px] text-brand-tan my-0.5">◆</Text>}
                    <Text className="text-[15px] font-extrabold text-brand-navy text-center mb-1">{event.title}</Text>
                    <Text className="text-xs text-brand-slate mb-2 font-semibold">{event.startDate}{event.endDate && event.endDate !== event.startDate ? ` – ${event.endDate}` : ''}</Text>
                    <View className="px-2.5 py-1 rounded-xl" style={{ backgroundColor: emotionStyle.bg }}>
                      <Text className="text-[11px] font-bold" style={{ color: emotionStyle.text }}>{event.emotionLabel}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Branch connector + failure node */}
                  {hasBranch && failureNodes.map(fn => {
                    const fEmotion = getEmotionStyle(fn.emotionLabel || 'Confident');
                    return (
                      <View key={fn.id} className="items-center mt-5">
                        <View className="w-10 h-0.5 bg-brand-slate mb-2">
                          <Text className="absolute -top-3.5 text-[10px] text-brand-slate bg-brand-cream px-1 font-semibold">despite</Text>
                        </View>
                        <TouchableOpacity
                          className="bg-brand-cream rounded-xl p-4 border-2 border-brand-rust w-[160px] items-center"
                          onPress={() => setSelectedNode(fn)}
                          activeOpacity={0.8}
                        >
                          <Text className="text-xs font-semibold mb-0.5 text-red-500">Failure</Text>
                          <Text className="text-[15px] font-extrabold text-brand-navy text-center mb-1">{fn.title}</Text>
                          <Text className="text-xs text-brand-slate mb-2 font-semibold">{fn.startDate}</Text>
                          <View className="px-2.5 py-1 rounded-xl" style={{ backgroundColor: fEmotion.bg }}>
                            <Text className="text-[11px] font-bold" style={{ color: fEmotion.text }}>{fn.emotionLabel}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>

      {/* Zoom controls */}
      <View className="absolute bottom-5 right-4 flex-row bg-brand-white rounded-[20px] px-1 py-1 gap-0.5 border border-brand-border elevation-4 shadow-sm">
        <TouchableOpacity className="w-9 h-9 rounded-[18px] justify-center items-center" onPress={() => setScale(Math.max(0.5, scale - 0.2))}>
          <Text className="text-base">🔍−</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-9 h-9 rounded-[18px] justify-center items-center" onPress={() => setScale(1)}>
          <Text className="text-base">⛶</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-9 h-9 rounded-[18px] justify-center items-center" onPress={() => setScale(Math.min(2, scale + 0.2))}>
          <Text className="text-base">🔍+</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal visible={selectedNode !== null} animationType="slide" transparent>
        <Pressable className="flex-1" style={{ backgroundColor: 'rgba(26, 32, 44, 0.6)' }} onPress={() => setSelectedNode(null)} />
        {selectedNode && (
          <View className="absolute bottom-0 left-0 right-0 bg-brand-cream rounded-t-[20px] p-6 max-h-[55%]">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-sm font-bold mb-1" style={{ color: NODE_BORDER_COLORS[selectedNode.nodeType || 'Job'] }}>{selectedNode.nodeType}</Text>
                <Text className="text-[24px] font-extrabold text-brand-navy leading-[30px]">{selectedNode.title}</Text>
                <Text className="text-sm text-brand-slate mt-1 font-semibold">{selectedNode.startDate}</Text>
                <View className="self-start mt-2 px-2.5 py-1 rounded-xl" style={{ backgroundColor: getEmotionStyle(selectedNode.emotionLabel || 'Confident').bg }}>
                  <Text className="text-[11px] font-bold" style={{ color: getEmotionStyle(selectedNode.emotionLabel || 'Confident').text }}>{selectedNode.emotionLabel}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedNode(null)} hitSlop={16}>
                <Text className="text-[22px] text-brand-slate">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="mt-4">
              {selectedNode.expandedDetails.context ? (
                <View className="mb-4">
                  <Text className="text-base font-extrabold text-brand-navy mb-1.5">Context</Text>
                  <Text className="text-[15px] text-brand-slate leading-[22px] font-medium">{selectedNode.expandedDetails.context}</Text>
                </View>
              ) : null}
              {selectedNode.expandedDetails.challengeFaced ? (
                <View className="mb-4">
                  <Text className="text-base font-extrabold text-brand-navy mb-1.5">Challenge</Text>
                  <Text className="text-[15px] text-brand-slate leading-[22px] font-medium">{selectedNode.expandedDetails.challengeFaced}</Text>
                </View>
              ) : null}
              {selectedNode.expandedDetails.emotionNote ? (
                <View className="mb-4">
                  <Text className="text-base font-extrabold text-brand-navy mb-1.5">Emotion note</Text>
                  <Text className="text-[15px] leading-[22px] font-medium italic text-slate-500">{selectedNode.expandedDetails.emotionNote}</Text>
                </View>
              ) : null}
              {selectedNode.expandedDetails.outcome ? (
                <View className="mb-4">
                  <Text className="text-base font-extrabold text-brand-navy mb-1.5">Outcome</Text>
                  <Text className="text-[15px] text-brand-slate leading-[22px] font-medium">{selectedNode.expandedDetails.outcome}</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}
