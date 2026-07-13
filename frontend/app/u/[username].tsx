import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, LayoutAnimation, UIManager, Platform, Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getCommunityJourney, CommunityJourney } from '../../api/community.api';
import { calculateDuration, formatToMonthYear } from '../../utils/helpers';
import { ExpandableGoalCard, ExpandableExperienceCard } from '../full-journey/expandables';
import { L } from '../../constants/colors';
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
export default function PublicProfilePage() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();

  const [journey, setJourney] = useState<CommunityJourney | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    if (username) {
      loadJourney();
    }
  }, [username]);

  const loadJourney = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCommunityJourney(username as string);
      setJourney(result);
    } catch (err: any) {
      setError(err?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const prepareGraphElements = () => {
    if (!journey) return "[]";
    const elements: any[] = [];
    // User Node
    elements.push({ data: { id: 'user', label: '@' + journey.user.username, color: L.navy, shape: 'ellipse', textColor: '#fff', borderWidth: 0, borderColor: '#000' } });

    // Goals
    journey.goals.forEach(g => {
      elements.push({ data: { id: 'g_' + g.id, label: g.title, color: L.terracotta, shape: 'round-rectangle', textColor: '#fff', borderWidth: 0, borderColor: '#000' } });
      elements.push({ data: { id: 'e_ug_' + g.id, source: 'user', target: 'g_' + g.id, label: 'HAS_GOAL' } });
    });

    // Experiences & Transitions
    journey.experiences.forEach(exp => {
      elements.push({ data: { id: 'x_' + exp.id, label: exp.title, color: L.teal, shape: 'round-rectangle', textColor: '#fff', borderWidth: 0, borderColor: '#000' } });
      elements.push({ data: { id: 'e_ux_' + exp.id, source: 'user', target: 'x_' + exp.id, label: 'HAS_EXPERIENCE' } });

      exp.goals?.forEach(g => {
        elements.push({ data: { id: `e_xg_${exp.id}_${g.id}`, source: 'x_' + exp.id, target: 'g_' + g.id, label: 'CONTRIBUTED_TO' } });
      });

      exp.skills?.forEach((s, idx) => {
        const sId = 's_' + exp.id + '_' + idx;
        elements.push({ data: { id: sId, label: s.name, color: L.surface, shape: 'round-rectangle', textColor: L.navy, borderWidth: 1, borderColor: L.teal } });
        elements.push({ data: { id: 'e_xs_' + sId, source: 'x_' + exp.id, target: sId, label: 'BUILT_SKILL' } });
      });

      if (exp.transition) {
        elements.push({ data: { id: 't_' + exp.id, source: 'x_' + exp.transition.toExperienceId, target: 'x_' + exp.id, label: exp.transition.decisionLabel || '' } });
      }
    });

    return JSON.stringify(elements);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: L.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={L.teal} />
        <Text style={{ marginTop: 12, color: L.navySoft, fontSize: 14 }}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !journey) {
    return (
      <View style={{ flex: 1, backgroundColor: L.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 15, color: L.navySoft, textAlign: 'center', marginBottom: 16 }}>{error || 'No profile found'}</Text>
        <TouchableOpacity onPress={loadJourney} style={{ backgroundColor: L.teal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Derive transitions from experiences for the UI mapping
  const transitions = journey.experiences
    .filter(e => e.transition)
    .map(e => ({ fromExperienceId: e.transition!.toExperienceId, toExperienceId: e.id, decisionLabel: e.transition!.decisionLabel }));

  return (
    <View style={{ flex: 1, backgroundColor: L.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: L.border, backgroundColor: L.background }}>
        <TouchableOpacity
          onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }}
          activeOpacity={0.7}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
        >
          <Feather name="arrow-left" size={20} color={L.navy} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '500', color: L.navy, letterSpacing: 0.4 }}>Public Profile</Text>
        </View>
        <TouchableOpacity onPress={() => setShowGraph(true)} style={{ backgroundColor: L.tealTint, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="git-merge" size={14} color={L.teal} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: L.teal }}>Graph</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>

        {/* Summary Stat Block */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: L.tealTint, borderRadius: 16, padding: 20, marginBottom: 32 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: journey.user.avatarUrl ? L.surface : '#9CA3AF', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 2, borderColor: L.teal, overflow: 'hidden' }}>
            {journey.user.avatarUrl ? (
              <Image source={{ uri: journey.user.avatarUrl }} style={{ width: 48, height: 48 }} />
            ) : (
              <Feather name="user" size={30} color="#475569" style={{ marginTop: 12 }} />
            )}
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '500', color: L.navy }}>@{journey.user.username}</Text>
            <Text style={{ fontSize: 12, fontWeight: '500', color: L.teal, marginTop: 4 }}>
              {journey.goals.length} Goals • {journey.experiences.length} Experiences
            </Text>
          </View>
        </View>

        {/* Goals Section */}
        {journey.goals.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: L.navy }}>GOALS</Text>
              <View style={{ flex: 1, maxWidth: 60, height: 1, backgroundColor: '#A3B8B5', borderRadius: 1 }} />
            </View>
            {journey.goals.map(goal => (
              <ExpandableGoalCard
                key={goal.id}
                title={goal.title}
                badgeText={goal.status}
                description={goal.description}
                topics={goal.topics || []}
                subtopics={goal.subtopics || ['Microservices', 'Event-Driven']}
                duration={calculateDuration(goal.startDate || '', goal.endDate || '')}
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
                <View style={{ flex: 1, maxWidth: 60, height: 1, backgroundColor: '#A3B8B5', borderRadius: 1 }} />
              </View>
              <View style={{ position: 'relative' }}>
                {/* Timeline Rail */}
                <View style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(62, 107, 102, 0.25)', zIndex: 1 }} />

                {journey.experiences.map((exp, index) => {
                  const matchingTransition = transitions.find(t => t.toExperienceId === exp.id);
                  const fromExperience = matchingTransition
                    ? journey.experiences.find(e => e.id === matchingTransition.fromExperienceId)
                    : null;
                  const calculatedTransitionLabel = fromExperience
                    ? fromExperience.title
                    : undefined;
                  const linkedGoalTitles = exp.goals
                    ? exp.goals.map(g => g.title).filter((title): title is string => !!title)
                    : [];
                  return (
                    <View key={exp.id} style={{ paddingLeft: 32, position: 'relative', zIndex: 10 }}>
                      <ExpandableExperienceCard
                        title={exp.title}
                        previewText={exp.timelineSummary}
                        organization={`${exp.organization || 'TechNova Global'}`}
                        duration={`${formatToMonthYear(exp.startDate || '')} - ${formatToMonthYear(exp.endDate || '')}`}
                        description={exp.context}
                        isVerified={exp.isVerified}
                        challenge={exp.challengeFaced ?? undefined}
                        outcome={exp.outcome ?? undefined}
                        achievements={exp.achievements ?? undefined}
                        skills={exp.skills?.map((s: any) => s.name) || []}
                        linkedGoalTitles={linkedGoalTitles}
                        transitionLabel={calculatedTransitionLabel}
                        transitionDecision={matchingTransition?.decisionLabel || undefined}
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
      <Modal visible={showGraph} animationType="slide" presentationStyle="formSheet">
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
      </Modal>

    </View>
  );
}
