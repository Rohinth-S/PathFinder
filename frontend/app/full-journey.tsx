import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Switch, Modal, Pressable, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserTrajectory, TimelineEvent } from '@/types/schema';
import { NODE_BORDER_COLORS, NODE_ICONS, getEmotionStyle } from '@/constants/colors';
import { BRAND_COLORS } from '../constants/colors';

/* ── Fallback data ─────────────────────────────────────── */

const FALLBACK: UserTrajectory = {
  username: 'fintech-founder-01', reputationScore: 94,
  timeline: [
    { id: 'f1', title: 'B.Tech in Computer Science', startDate: '2016', endDate: '2019', organization: 'University', isVerified: true, nodeType: 'Education', emotionLabel: 'Confident', timelineSummary: 'CS degree', expandedDetails: { context: 'Undergraduate CS education with focus on systems.', challengeFaced: 'Balancing academics and projects.', outcome: 'Strong fundamentals.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Algorithms', 'Java'], transitions: [{ decisionLabel: 'Joined a SaaS startup', toExperienceId: 'f2' }] } },
    { id: 'f2', title: 'Software Engineer at SaaS Startup', startDate: '2019', endDate: '2021', organization: 'SaaS Corp', isVerified: true, nodeType: 'Job', emotionLabel: 'Confident', timelineSummary: 'Full-stack development', expandedDetails: { context: 'Joined as employee #12 at an early-stage B2B SaaS.', challengeFaced: 'Wearing many hats, resource constraints.', outcome: 'Built full-stack skills, understood sales cycles.', achievements: ['Shipped 3 major features', 'Promoted in 18 months'], applicationStatus: null, emotionNote: null, goals: [], skills: ['React', 'Node.js', 'PostgreSQL'], transitions: [{ decisionLabel: 'Decided to learn the industry deeply', toExperienceId: 'f3' }] } },
    { id: 'f3', title: 'Worked for 2 years to learn industry', startDate: '2021', endDate: '2021', organization: '', isVerified: false, nodeType: 'Decision', emotionLabel: 'Uncertain', timelineSummary: 'Stayed to understand fintech deeply', expandedDetails: { context: 'Felt I lacked real-world experience in payments and lending. Wanted to understand how fintech products work, how teams operate, and build my network.', challengeFaced: 'Uncertainty about timing — was I wasting time?', outcome: 'Built deep domain knowledge and professional network.', achievements: null, applicationStatus: null, emotionNote: "'I was unsure if I was wasting time by not starting early, but deep down I knew this would make me stronger in the long run.'", goals: [], skills: ['Domain Knowledge', 'Networking'], transitions: [{ decisionLabel: 'Left to build own product', toExperienceId: 'f4' }] } },
    { id: 'f4', title: 'Senior Software Engineer at Fintech Company', startDate: '2021', endDate: '2022', organization: 'Fintech Co', isVerified: true, nodeType: 'Job', emotionLabel: 'Confident', timelineSummary: 'Deepened fintech domain expertise', expandedDetails: { context: 'Moved to a fintech company to gain direct domain knowledge.', challengeFaced: 'Complex regulatory environment.', outcome: 'Understood payments infrastructure deeply.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Payments', 'Compliance'], transitions: [{ decisionLabel: 'Left job to build fintech product', toExperienceId: 'f5' }] } },
    { id: 'f5', title: 'Left job to build fintech product', startDate: '2022', endDate: '2022', organization: '', isVerified: false, nodeType: 'Decision', emotionLabel: 'Pivoting', timelineSummary: 'Took the leap', expandedDetails: { context: 'Had enough domain knowledge and savings.', challengeFaced: 'Leaving stability.', outcome: 'Started building full-time.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Entrepreneurship'], transitions: [{ decisionLabel: 'Building startup', toExperienceId: 'f7' }] } },
    { id: 'f6', title: 'First startup idea failed', startDate: '2022', endDate: '2022', organization: '', isVerified: false, nodeType: 'Failure', emotionLabel: 'Pushing through', timelineSummary: 'Initial idea did not gain traction', expandedDetails: { context: 'First attempt at a lending product failed due to regulatory issues.', challengeFaced: 'Compliance complexity and no legal team.', outcome: 'Learned what NOT to build. Pivoted approach.', achievements: null, applicationStatus: null, emotionNote: "'It felt like everything was crumbling, but I refused to give up.'", goals: [], skills: ['Resilience'], transitions: [] } },
    { id: 'f7', title: 'Building fintech startup', startDate: '2023', endDate: 'Present', organization: 'FinServe', isVerified: true, nodeType: 'Startup', emotionLabel: 'Confident', timelineSummary: 'Building B2B payments infrastructure', expandedDetails: { context: 'Applied all learnings from the failed attempt.', challengeFaced: 'Scaling team and product.', outcome: 'Growing steadily with strong retention.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Leadership', 'Fundraising'], transitions: [{ decisionLabel: 'Reached $150K ARR', toExperienceId: 'f8' }] } },
    { id: 'f8', title: 'First revenue $150K ARR', startDate: '2024', endDate: '2024', organization: 'FinServe', isVerified: true, nodeType: 'Achievement', emotionLabel: 'Confident', timelineSummary: 'Hit product-market fit', expandedDetails: { context: 'Milestone achieved.', challengeFaced: 'Maintaining growth rate.', outcome: 'Strong ARR with enterprise customers.', achievements: ['$150K ARR', '10 enterprise clients'], applicationStatus: null, emotionNote: null, goals: [], skills: ['Scaling'], transitions: [] } },
  ],
};

/* ── Component ─────────────────────────────────────────── */

export default function FullJourneyPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userData?: string }>();
  const [showRelevant, setShowRelevant] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TimelineEvent | null>(null);
  const [scale, setScale] = useState(1);

  let user: UserTrajectory = FALLBACK;
  try { if (params.userData) user = JSON.parse(params.userData); } catch { /* fallback */ }

  // Separate failure nodes for branching
  const mainTimeline = user.timeline.filter(e => e.nodeType !== 'Failure');
  const failureNodes = user.timeline.filter(e => e.nodeType === 'Failure');

  // Find the index after which the failure branches off (the Decision node before it)
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
          <Text className="text-[13px] text-brand-slate mt-0.5">Journey 1 of 18</Text>
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


