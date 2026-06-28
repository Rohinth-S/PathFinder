import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Modal, Pressable, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserTrajectory, TimelineEvent } from '@/types/schema';
import { NODE_BORDER_COLORS, NODE_ICONS, getEmotionStyle } from '@/constants/colors';

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
    <View style={st.wrapper}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={st.back}>←</Text></TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle}>Full Journey</Text>
          <Text style={st.headerSub}>Journey 1 of 18</Text>
        </View>
        <View style={st.toggleRow}>
          <Text style={st.toggleLabel}>Show relevant only</Text>
          <Switch value={showRelevant} onValueChange={setShowRelevant} trackColor={{ false: '#CBD5E1', true: '#6366F1' }} thumbColor="#FFF" style={{ transform: [{ scale: 0.7 }] }} />
        </View>
      </View>

      {/* Flowchart */}
      <ScrollView style={st.scrollArea} contentContainerStyle={st.scrollContent}>
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
                  <View style={st.edgeLabelWrap}>
                    <View style={st.dashedSeg} />
                    <Text style={st.edgeLabel}>
                      {event.nodeType === 'Failure' ? 'despite' : idx === mainTimeline.length - 1 ? 'led to' : event.expandedDetails.transitions.length > 0 ? 'led to' : 'caused'}
                    </Text>
                    <View style={st.dashedSeg} />
                  </View>
                )}

                {/* Row: main node + optional branch */}
                <View style={st.nodeRow}>
                  {/* Main node */}
                  <TouchableOpacity
                    style={[st.nodeCard, { borderColor }]}
                    onPress={() => setSelectedNode(event)}
                    activeOpacity={0.8}
                  >
                    <Text style={[st.nodeType, { color: borderColor }]}>{event.nodeType}</Text>
                    {event.nodeType === 'Decision' && <Text style={st.diamondIcon}>◆</Text>}
                    <Text style={st.nodeTitle}>{event.title}</Text>
                    <Text style={st.nodeYear}>{event.startDate}{event.endDate && event.endDate !== event.startDate ? ` – ${event.endDate}` : ''}</Text>
                    <View style={[st.emotionPill, { backgroundColor: emotionStyle.bg }]}>
                      <Text style={[st.emotionText, { color: emotionStyle.text }]}>{event.emotionLabel}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Branch connector + failure node */}
                  {hasBranch && failureNodes.map(fn => {
                    const fEmotion = getEmotionStyle(fn.emotionLabel || 'Confident');
                    return (
                      <View key={fn.id} style={st.branchWrap}>
                        <View style={st.branchConnector}>
                          <Text style={st.branchLabel}>despite</Text>
                        </View>
                        <TouchableOpacity
                          style={[st.nodeCard, st.failureCard]}
                          onPress={() => setSelectedNode(fn)}
                          activeOpacity={0.8}
                        >
                          <Text style={[st.nodeType, { color: '#EF4444' }]}>Failure</Text>
                          <Text style={st.nodeTitle}>{fn.title}</Text>
                          <Text style={st.nodeYear}>{fn.startDate}</Text>
                          <View style={[st.emotionPill, { backgroundColor: fEmotion.bg }]}>
                            <Text style={[st.emotionText, { color: fEmotion.text }]}>{fn.emotionLabel}</Text>
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
      <View style={st.zoomBar}>
        <TouchableOpacity style={st.zoomBtn} onPress={() => setScale(Math.max(0.5, scale - 0.2))}>
          <Text style={st.zoomIcon}>🔍−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.zoomBtn} onPress={() => setScale(1)}>
          <Text style={st.zoomIcon}>⛶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.zoomBtn} onPress={() => setScale(Math.min(2, scale + 0.2))}>
          <Text style={st.zoomIcon}>🔍+</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal visible={selectedNode !== null} animationType="slide" transparent>
        <Pressable style={st.overlay} onPress={() => setSelectedNode(null)} />
        {selectedNode && (
          <View style={st.sheet}>
            <View style={st.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[st.sheetType, { color: NODE_BORDER_COLORS[selectedNode.nodeType || 'Job'] }]}>{selectedNode.nodeType}</Text>
                <Text style={st.sheetTitle}>{selectedNode.title}</Text>
                <Text style={st.sheetYear}>{selectedNode.startDate}</Text>
                <View style={[st.emotionPill, { backgroundColor: getEmotionStyle(selectedNode.emotionLabel || 'Confident').bg, alignSelf: 'flex-start', marginTop: 8 }]}>
                  <Text style={[st.emotionText, { color: getEmotionStyle(selectedNode.emotionLabel || 'Confident').text }]}>{selectedNode.emotionLabel}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedNode(null)} hitSlop={16}>
                <Text style={st.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 16 }}>
              {selectedNode.expandedDetails.context ? (
                <View style={st.sheetSection}>
                  <Text style={st.sheetSectionTitle}>Context</Text>
                  <Text style={st.sheetBody}>{selectedNode.expandedDetails.context}</Text>
                </View>
              ) : null}
              {selectedNode.expandedDetails.challengeFaced ? (
                <View style={st.sheetSection}>
                  <Text style={st.sheetSectionTitle}>Challenge</Text>
                  <Text style={st.sheetBody}>{selectedNode.expandedDetails.challengeFaced}</Text>
                </View>
              ) : null}
              {selectedNode.expandedDetails.emotionNote ? (
                <View style={st.sheetSection}>
                  <Text style={st.sheetSectionTitle}>Emotion note</Text>
                  <Text style={[st.sheetBody, { fontStyle: 'italic', color: '#64748B' }]}>{selectedNode.expandedDetails.emotionNote}</Text>
                </View>
              ) : null}
              {selectedNode.expandedDetails.outcome ? (
                <View style={st.sheetSection}>
                  <Text style={st.sheetSectionTitle}>Outcome</Text>
                  <Text style={st.sheetBody}>{selectedNode.expandedDetails.outcome}</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const st = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, paddingTop: 20, gap: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  back: { fontSize: 24, color: '#0F172A', marginTop: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toggleLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },

  scrollArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 80, alignItems: 'center' },

  edgeLabelWrap: { alignItems: 'center', marginVertical: 4, gap: 4 },
  dashedSeg: { width: 2, height: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  edgeLabel: { fontSize: 12, color: '#64748B', backgroundColor: '#F8FAFC', paddingHorizontal: 8 },

  nodeRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },

  nodeCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 2, width: 200, alignItems: 'center' },
  nodeType: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  diamondIcon: { fontSize: 20, color: '#F59E0B', marginVertical: 2 },
  nodeTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 4 },
  nodeYear: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  emotionPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  emotionText: { fontSize: 11, fontWeight: '600' },

  failureCard: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', width: 160 },

  branchWrap: { alignItems: 'center', marginTop: 20 },
  branchConnector: { width: 40, height: 2, backgroundColor: '#94A3B8', marginBottom: 8 },
  branchLabel: { position: 'absolute', top: -14, fontSize: 10, color: '#64748B', backgroundColor: '#F8FAFC', paddingHorizontal: 4 },

  zoomBar: { position: 'absolute', bottom: 20, right: 16, flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 4, paddingVertical: 4, gap: 2, borderWidth: 1, borderColor: '#E2E8F0', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  zoomBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  zoomIcon: { fontSize: 16 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '55%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sheetType: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', lineHeight: 30 },
  sheetYear: { fontSize: 14, color: '#64748B', marginTop: 4 },
  closeX: { fontSize: 22, color: '#94A3B8' },

  sheetSection: { marginBottom: 16 },
  sheetSectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  sheetBody: { fontSize: 15, color: '#475569', lineHeight: 22 },
});
