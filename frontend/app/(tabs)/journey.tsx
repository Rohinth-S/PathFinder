import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, LayoutAnimation, UIManager, Platform, Image
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getUserJourney, UserJourneyResponse } from '../../api/journey.api';
import { calculateDuration, formatToMonthYear } from '../../utils/helpers';
import { ExpandableGoalCard, ExpandableExperienceCard } from '../full-journey/expandables';
import { L, getEmotionStyle } from '../../constants/colors';
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ───────────────────────────────────────────────
// Cytoscape HTML Template
// ───────────────────────────────────────────────
const createCytoscapeHtml = (elementsJson: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.23.0/cytoscape.min.js"></script>
    <style>
        body, html { width: 100%; height: 100%; margin: 0; padding: 0; background-color: ${L.background}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        #cy { width: 100%; height: 100%; }
        /* A gentle fade-in animation for the graph */
        #cy { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    </style>
</head>
<body>
    <div id="cy"></div>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            var cy = cytoscape({
                container: document.getElementById('cy'),
                elements: ${elementsJson},
                style: [
                    {
                        selector: 'node',
                        style: {
                            'label': 'data(label)',
                            'text-valign': 'center',
                            'color': 'data(textColor)',
                            'font-size': '13px',
                            'font-family': 'system-ui, -apple-system, sans-serif',
                            'font-weight': 'bold',
                            'background-color': 'data(color)',
                            'shape': 'data(shape)',
                            'border-width': 'data(borderWidth)',
                            'border-color': 'data(borderColor)',
                            'width': 'label',
                            'height': 'label',
                            'padding': '16px',
                            'text-wrap': 'wrap',
                            'text-max-width': '120px',
                            'text-justification': 'center',
                            'shadow-blur': 12,
                            'shadow-color': '#0f172a',
                            'shadow-opacity': 0.08,
                            'shadow-offset-y': 4,
                            'transition-property': 'background-color, border-color, shadow-opacity',
                            'transition-duration': '0.3s'
                        }
                    },
                    {
                        selector: 'node[shape="ellipse"]',
                        style: {
                            'padding': '20px',
                            'font-size': '14px',
                            'shadow-opacity': 0.15,
                            'shadow-offset-y': 6,
                            'shadow-blur': 16,
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 2,
                            'line-color': '#CBD5E1',
                            'target-arrow-color': '#CBD5E1',
                            'target-arrow-shape': 'vee',
                            'curve-style': 'bezier',
                            'label': 'data(label)',
                            'font-size': '10px',
                            'font-weight': '600',
                            'font-family': 'system-ui, -apple-system, sans-serif',
                            'text-background-opacity': 1,
                            'text-background-color': '${L.background}',
                            'text-background-shape': 'roundrectangle',
                            'text-background-padding': '4px',
                            'text-border-opacity': 1,
                            'text-border-width': 1,
                            'text-border-color': '#E2E8F0',
                            'color': '#475569',
                            'text-wrap': 'ellipsis',
                            'text-max-width': '100px',
                            'text-rotation': 'none', /* Keeps labels readable horizontally */
                            'edge-text-rotation': 'none'
                        }
                    },
                    {
                        selector: 'edge[label="HAS_EXPERIENCE"], edge[label="HAS_GOAL"]',
                        style: {
                            'line-style': 'dashed',
                            'line-dash-pattern': [4, 4],
                            'line-color': '#94A3B8',
                            'target-arrow-color': '#94A3B8'
                        }
                    }
                ],
                layout: {
                  name: 'cose',
                  animate: true,
                  animationDuration: 800,
                  animationEasing: 'ease-out',
                  fit: true,           
                  padding: 50,         
                  componentSpacing: 100,
                  nodeRepulsion: 40000,
                  idealEdgeLength: 120,
                  edgeElasticity: 60,
                  nestingFactor: 1.2
                }
            });

            // Interactive hover effects for modern feel
            cy.on('tapstart', 'node', function(e) {
                var node = e.target;
                node.style('shadow-opacity', 0.25);
            });
            cy.on('tapend', 'node', function(e) {
                var node = e.target;
                node.style('shadow-opacity', node.data('shape') === 'ellipse' ? 0.15 : 0.08);
            });
        });
    </script>
</body>
</html>
`;

// ───────────────────────────────────────────────
// Main Page
// ───────────────────────────────────────────────
export default function HistoryPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const [journey, setJourney] = useState<UserJourneyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadJourney();
    }, [])
  );

  const loadJourney = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const result = await getUserJourney(token);
      setJourney(result);
    } catch (err: any) {
      setError(err?.message || "Failed to load journey");
    } finally {
      setIsLoading(false);
    }
  };

  const prepareGraphElements = () => {
    if (!journey) return "[]";
    const elements: any[] = [];
    // User Node
    elements.push({ data: { id: 'user', label: '@' + journey.username, color: L.navy, shape: 'ellipse', textColor: '#fff', borderWidth: 0, borderColor: '#000' } });

    // Goals
    journey.goals.forEach(g => {
      elements.push({ data: { id: 'g_' + g.id, label: g.title, color: L.terracotta, shape: 'round-rectangle', textColor: '#fff', borderWidth: 0, borderColor: '#000' } });
      elements.push({ data: { id: 'e_ug_' + g.id, source: 'user', target: 'g_' + g.id, label: 'HAS_GOAL' } });
    });

    // Experiences
    journey.experiences.forEach(exp => {
      elements.push({ data: { id: 'x_' + exp.id, label: exp.title, color: L.teal, shape: 'round-rectangle', textColor: '#fff', borderWidth: 0, borderColor: '#000' } });
      elements.push({ data: { id: 'e_ux_' + exp.id, source: 'user', target: 'x_' + exp.id, label: 'HAS_EXPERIENCE' } });

      exp.goalIds?.forEach(gid => {
        elements.push({ data: { id: `e_xg_${exp.id}_${gid}`, source: 'x_' + exp.id, target: 'g_' + gid, label: 'CONTRIBUTED_TO' } });
      });

      exp.skills?.forEach((s, idx) => {
        const sId = 's_' + exp.id + '_' + idx;
        elements.push({ data: { id: sId, label: s.name, color: L.surface, shape: 'round-rectangle', textColor: L.navy, borderWidth: 1, borderColor: L.teal } });
        elements.push({ data: { id: 'e_xs_' + sId, source: 'x_' + exp.id, target: sId, label: 'BUILT_SKILL' } });
      });
    });

    // Transitions
    journey.transitions.forEach((t, idx) => {
      elements.push({ data: { id: 't_' + idx, source: 'x_' + t.fromExperienceId, target: 'x_' + t.toExperienceId, label: t.decisionLabel } });
    });

    return JSON.stringify(elements);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: L.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={L.teal} />
        <Text style={{ marginTop: 12, color: L.navySoft, fontSize: 14 }}>Loading journey...</Text>
      </View>
    );
  }

  if (error || !journey) {
    return (
      <View style={{ flex: 1, backgroundColor: L.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 15, color: L.navySoft, textAlign: 'center', marginBottom: 16 }}>{error || 'No journey found'}</Text>
        <TouchableOpacity onPress={loadJourney} style={{ backgroundColor: L.teal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: L.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: L.border, backgroundColor: L.background }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '500', color: L.navy, letterSpacing: 0.4 }}>Journey</Text>
        </View>
        <TouchableOpacity onPress={() => setShowGraph(true)} style={{ backgroundColor: L.tealTint, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="git-merge" size={14} color={L.teal} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: L.teal }}>Graph</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>

        {/* Summary Stat Block */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: L.tealTint, borderRadius: 16, padding: 20, marginBottom: 32 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: clerkUser?.hasImage ? L.surface : '#9CA3AF', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 2, borderColor: L.teal, overflow: 'hidden' }}>
            {clerkUser?.hasImage ? (
              <Image source={{ uri: clerkUser.imageUrl }} style={{ width: 48, height: 48 }} />
            ) : (
              <Feather name="user" size={30} color="#475569" style={{ marginTop: 12 }} />
            )}
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '500', color: L.navy }}>@{journey.username}</Text>
            <Text style={{ fontSize: 12, fontWeight: '500', color: L.teal, marginTop: 4 }}>
              {journey.statistics.goals} Goals • {journey.statistics.experiences} Experiences
            </Text>
          </View>
        </View>

        {/* Goals Section */}
        {journey.goals.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: L.navy }}>GOALS</Text>
              <View style={{ flex: 1, maxWidth: 60, height: 1, backgroundColor: '#A3B8B5', borderRadius: 1, }} />
            </View>
            {journey.goals.map(goal => (
              <ExpandableGoalCard
                key={goal.id}
                title={goal.title}
                badgeText={goal.status}
                description={goal.description}
                topics={goal.topics || []}
                subtopics={goal.subtopics || ['Microservices', 'Event-Driven']} // Falls back cleanly if array is empty
                duration={calculateDuration(goal.startDate, goal.endDate)}
              />
            ))}
          </View>
        )}

        {/* Timeline Section */}
        {journey.experiences.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: L.navy }}> EXPERIENCE TIMELINE</Text>
                <View style={{ flex: 1, maxWidth: 60, height: 1, backgroundColor: '#A3B8B5', borderRadius: 1, }} />
              </View>
              <View style={{ position: 'relative' }}>
                {/* Timeline Rail */}
                <View style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(62, 107, 102, 0.25)', zIndex: 1 }} />

                {journey.experiences.map((exp, index) => {
                  const matchingTransition = journey.transitions.find(t => t.toExperienceId === exp.id);
                  const fromExperience = matchingTransition
                    ? journey.experiences.find(e => e.id === matchingTransition.fromExperienceId)
                    : null;
                  const calculatedTransitionLabel = fromExperience
                    ? fromExperience.title
                    : undefined;
                  const linkedGoalTitles = exp.goalIds && journey.goals
                    ? exp.goalIds
                      .map(gid => journey.goals.find(g => g.id === gid)?.title)
                      .filter((title): title is string => !!title)
                    : [];
                  return (
                    <View key={exp.id} style={{ paddingLeft: 32, position: 'relative', zIndex: 10 }}>
                      <ExpandableExperienceCard
                        title={exp.title}
                        previewText={exp.timelineSummary}
                        organization={`${exp.organization || 'TechNova Global'}`}
                        duration={`${formatToMonthYear(exp.startDate)} - ${formatToMonthYear(exp.endDate)}`}
                        description={exp.context}
                        isVerified={exp.isVerified}
                        challenge={exp.challengeFaced ?? undefined}
                        outcome={exp.outcome ?? undefined}
                        achievements={exp.achievements ?? undefined}
                        skills={exp.skills?.map((s: any) => s.name) || []}
                        linkedGoalTitles={linkedGoalTitles}
                        transitionLabel={calculatedTransitionLabel}
                        transitionDecision={matchingTransition?.decisionLabel}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView >

      {/* Graph Modal */}
      < Modal visible={showGraph} animationType="slide" presentationStyle="formSheet" >
        <View style={{ flex: 1, backgroundColor: L.background }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: L.border, backgroundColor: L.surface }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: L.navy }}>Knowledge Graph Preview</Text>
            <TouchableOpacity onPress={() => setShowGraph(false)} style={{ padding: 8, backgroundColor: L.surface, borderRadius: 20 }}>
              <Feather name="x" size={20} color={L.navy} />
            </TouchableOpacity>
          </View>
          {Platform.OS === 'web' ? (
            <iframe
              // @ts-ignore
              srcDoc={createCytoscapeHtml(prepareGraphElements())}
              style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: createCytoscapeHtml(prepareGraphElements()) }}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </Modal >

    </View >
  );
}
