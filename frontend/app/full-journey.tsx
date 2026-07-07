import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, LayoutAnimation, UIManager, Platform, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getUserJourney, UserJourneyResponse } from '../api/journey.api';
import { L, getEmotionStyle } from '@/constants/colors';
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
        body, html { width: 100%; height: 100%; margin: 0; padding: 0; background-color: ${L.background}; font-family: sans-serif; }
        #cy { width: 100%; height: 100%; }
        .close-btn {
            position: absolute; top: 16px; right: 16px; z-index: 10;
            background: white; border-radius: 20px; padding: 8px 16px;
            font-weight: bold; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
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
                            'color': '#fff',
                            'font-size': '10px',
                            'font-weight': 'bold',
                            'background-color': 'data(color)',
                            'shape': 'data(shape)',
                            'width': 'label',
                            'height': 'label',
                            'padding': '10px',
                            'text-wrap': 'wrap',
                            'text-max-width': '80px'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 2,
                            'line-color': '#ccc',
                            'target-arrow-color': '#ccc',
                            'target-arrow-shape': 'triangle',
                            'curve-style': 'bezier',
                            'label': 'data(label)',
                            'font-size': '8px',
                            'text-rotation': 'autorotate',
                            'text-background-opacity': 1,
                            'text-background-color': '${L.background}',
                            'text-background-padding': '2px',
                            'color': '#666'
                        }
                    }
                ],
                layout: {
                    name: 'breadthfirst',
                    directed: true,
                    padding: 30
                }
            });
        });
    </script>
</body>
</html>
`;

// ───────────────────────────────────────────────
// Expandable Card Component
// ───────────────────────────────────────────────
function ExpandableCard({ title, subtitle, badgeText, badgeColor, children, isVerified, nodeType }: any) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  return (
    <View style={{ backgroundColor: L.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: L.border, shadowColor: '#152238', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.7}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            {nodeType && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: L.teal, letterSpacing: 1, textTransform: 'uppercase' }}>{nodeType}</Text>
                {isVerified && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, backgroundColor: L.tealTint, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 }}>
                    <Feather name="shield" size={10} color={L.teal} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 10, fontWeight: '600', color: L.teal }}>Verified</Text>
                  </View>
                )}
              </View>
            )}
            <Text style={{ fontSize: 17, fontWeight: '700', color: L.navy, marginBottom: 4 }}>{title}</Text>
            {subtitle && <Text style={{ fontSize: 13, fontWeight: '500', color: L.navySoft }}>{subtitle}</Text>}
          </View>
          {badgeText && (
            <View style={{ backgroundColor: badgeColor.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: badgeColor.text }}>{badgeText}</Text>
            </View>
          )}
        </View>
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color={L.navySoft} />
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: L.border }}>
          {children}
        </View>
      )}
    </View>
  );
}

// ───────────────────────────────────────────────
// Main Page
// ───────────────────────────────────────────────
export default function FullJourneyPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  
  const [journey, setJourney] = useState<UserJourneyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);

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
    elements.push({ data: { id: 'user', label: '@' + journey.username, color: '#3182ce', shape: 'ellipse' } });
    
    // Goals
    journey.goals.forEach(g => {
      elements.push({ data: { id: 'g_' + g.id, label: g.title, color: '#dd6b20', shape: 'round-rectangle' } });
      elements.push({ data: { id: 'e_ug_' + g.id, source: 'user', target: 'g_' + g.id, label: 'HAS_GOAL' } });
    });

    // Experiences
    journey.experiences.forEach(exp => {
      elements.push({ data: { id: 'x_' + exp.id, label: exp.title, color: '#319795', shape: 'round-rectangle' } });
      elements.push({ data: { id: 'e_ux_' + exp.id, source: 'user', target: 'x_' + exp.id, label: 'HAS_EXPERIENCE' } });
      
      exp.goalIds?.forEach(gid => {
        elements.push({ data: { id: `e_xg_${exp.id}_${gid}`, source: 'x_' + exp.id, target: 'g_' + gid, label: 'CONTRIBUTED_TO' } });
      });

      exp.skills?.forEach((s, idx) => {
        const sId = 's_' + exp.id + '_' + idx;
        elements.push({ data: { id: sId, label: s.name, color: '#38a169', shape: 'ellipse' } });
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
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: L.border, backgroundColor: L.surface }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Feather name="chevron-left" size={28} color={L.navy} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: L.navy }}>Full Journey</Text>
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
            <Text style={{ fontSize: 16, fontWeight: '700', color: L.navy }}>@{journey.username}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: L.teal, marginTop: 4 }}>
              {journey.statistics.goals} Goals • {journey.statistics.experiences} Experiences
            </Text>
          </View>
        </View>

        {/* Goals Section */}
        {journey.goals.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: L.navy, marginBottom: 16 }}>Core Goals</Text>
            {journey.goals.map(goal => {
              let badgeColor = { bg: L.surface, text: L.navySoft };
              if (goal.status === 'ACTIVE') badgeColor = { bg: L.tealTint, text: L.teal };
              if (goal.status === 'ACHIEVED') badgeColor = { bg: 'rgba(196, 90, 68, 0.1)', text: L.terracotta }; // terracotta-tint

              return (
                <ExpandableCard
                  key={goal.id}
                  title={goal.title}
                  badgeText={goal.status}
                  badgeColor={badgeColor}
                >
                  <Text style={{ fontSize: 14, color: L.navySoft, lineHeight: 22 }}>{goal.description}</Text>
                  {goal.topics.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 }}>
                      {goal.topics.map((t, i) => (
                        <View key={i} style={{ backgroundColor: L.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: L.border }}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: L.navy }}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </ExpandableCard>
              );
            })}
          </View>
        )}

        {/* Timeline Section */}
        {journey.experiences.length > 0 && (
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: L.navy, marginBottom: 16 }}>Timeline</Text>
            <View style={{ marginLeft: 8 }}>
              {/* Timeline Rail */}
              <View style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(62, 107, 102, 0.25)' }} />
              
              {journey.experiences.map((exp, index) => {
                const isFailure = exp.title.toLowerCase().includes('fail') || (exp.outcome?.toLowerCase().includes('fail'));
                const nodeType = isFailure ? 'Failure' : 'Experience';
                
                return (
                  <View key={exp.id} style={{ flexDirection: 'row', marginBottom: 16 }}>
                    {/* Node Dot */}
                    <View style={{ width: 32, alignItems: 'center', marginTop: 24, zIndex: 10 }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: L.teal, borderWidth: 2, borderColor: L.surface }} />
                    </View>
                    
                    {/* Card */}
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      {/* Transition Label if exists */}
                      {index > 0 && journey.transitions.find(t => t.toExperienceId === exp.id) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Feather name="corner-up-left" size={12} color={L.teal} style={{ marginRight: 6 }} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: L.teal }}>
                            {journey.transitions.find(t => t.toExperienceId === exp.id)?.decisionLabel}
                          </Text>
                        </View>
                      )}

                      <ExpandableCard
                        title={exp.title}
                        subtitle={`${exp.startDate} ${exp.endDate ? '- ' + exp.endDate : ''}`}
                        nodeType={nodeType}
                        isVerified={exp.isVerified}
                      >
                        <Text style={{ fontSize: 14, color: L.navy, fontWeight: '600', marginBottom: 4 }}>Context</Text>
                        <Text style={{ fontSize: 14, color: L.navySoft, lineHeight: 22, marginBottom: 16 }}>{exp.context}</Text>
                        
                        {exp.outcome && (
                          <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 14, color: L.navy, fontWeight: '600', marginBottom: 4 }}>Outcome</Text>
                            <Text style={{ fontSize: 14, color: L.navySoft, lineHeight: 22 }}>{exp.outcome}</Text>
                          </View>
                        )}

                        {exp.skills?.length > 0 && (
                          <View>
                            <Text style={{ fontSize: 14, color: L.navy, fontWeight: '600', marginBottom: 8 }}>Skills Gained</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                              {exp.skills.map((s, i) => (
                                <View key={i} style={{ backgroundColor: L.tealTint, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                                  <Text style={{ fontSize: 11, fontWeight: '600', color: L.teal }}>{s.name}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </ExpandableCard>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

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
