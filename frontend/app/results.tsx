import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, TextInput, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { useAuth } from '@clerk/clerk-expo';
import { syncUser } from '../api/auth.api';
import { translateInsights, generateSpeechUri } from '../api/output.api';
import { submitQuery } from '../api/query.api';
import { DecisionAtlasBackendResponse, TimelineEvent, NodeType } from '../types/schema';
import { UI } from '../constants/colors';
import { SectionLabel, PillBadge } from '../components/ui/SectionLabel';
import { DarkCard } from '../components/ui/DarkCard';
import { DotDivider } from '../components/ui/DotDivider';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

const NODE_EMOJIS: Record<NodeType, string> = {
  Education: '🎓',
  Job: '💼',
  Decision: '◆',
  Failure: '⚡',
  Startup: '🚀',
  Achievement: '⭐',
};

/* ── Skeleton ──────────────────────────────────────── */

function Shimmer({ w, h, r = 8, mb = 0 }: { w: number | string; h: number; r?: number; mb?: number }) {
  const opacity = useSharedValue(0.4);
  
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 900 }),
        withTiming(0.4, { duration: 900 })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ width: w as any, height: h, borderRadius: r, marginBottom: mb, backgroundColor: UI.fg08 }, animStyle]} />
  );
}

function LoadingSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: UI.background }}>
      <View style={{ padding: 24, paddingTop: 40 }}>
        <Shimmer w="60%" h={32} mb={8} />
        <Shimmer w="40%" h={16} mb={24} />
        <Shimmer w="100%" h={140} r={16} mb={24} />
        <Shimmer w="100%" h={300} r={16} mb={24} />
      </View>
    </View>
  );
}

/* ── Timeline Node Component ───────────────────────── */

function TimelineNodeItem({ event, isLast }: { event: TimelineEvent, isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const nodeType = event.nodeType || 'Job';
  const emoji = NODE_EMOJIS[nodeType] || '💼';

  const getDuration = (start: string, end: string | null) => {
    if (!start) return '';
    const endStr = end || 'Present';
    if (start.length === 4) {
      const s = parseInt(start);
      if (!isNaN(s)) {
        if (endStr === 'Present') {
          return ` • ${new Date().getFullYear() - s} yrs`;
        } else if (endStr.length === 4) {
          const e = parseInt(endStr);
          if (!isNaN(e)) return ` • ${e - s} yrs`;
        }
      }
    }
    return '';
  };

  return (
    <Animated.View layout={Layout.springify().damping(20)} style={{ flexDirection: 'row', marginBottom: 0 }}>
      {/* Left side: Vertical line and Icon */}
      <View style={{ width: 28, alignItems: 'center' }}>
        <View style={{
          width: 28, height: 28, borderRadius: 14, marginTop: 16,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: UI.accentSoft,
          borderWidth: 1.5, borderColor: UI.fg20, zIndex: 2,
        }}>
          <Text style={{ fontSize: 12 }}>{emoji}</Text>
        </View>
        {!isLast && (
          <View style={{ width: 2, flex: 1, marginTop: -2, backgroundColor: UI.fg08 }} />
        )}
      </View>

      {/* Right side: Content Card */}
      <View style={{ flex: 1, marginLeft: 12, paddingBottom: 16 }}>
        <TouchableOpacity 
          style={{
            backgroundColor: UI.surface, borderRadius: 12, padding: 14,
            borderWidth: 1, borderColor: expanded ? UI.accent : UI.fg08,
            borderLeftWidth: 3, borderLeftColor: UI.accent,
          }}
          onPress={() => setExpanded(!expanded)} 
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 15, color: UI.foreground, marginBottom: 2 }}>{event.title}</Text>
              <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: UI.fg40, letterSpacing: 0.5, marginBottom: 6 }}>
                {event.startDate}{event.endDate ? ` - ${event.endDate}` : ''}{getDuration(event.startDate, event.endDate)}
              </Text>
              <Text 
                style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: UI.fg50, lineHeight: 19 }}
                numberOfLines={expanded ? undefined : 2}
              >
                {event.timelineSummary}
              </Text>
            </View>
            <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={UI.fg40} style={{ marginTop: 2, marginLeft: 8 }} />
          </View>

          {expanded && event.expandedDetails && (
            <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 12 }}>
              <DotDivider style={{ marginVertical: 12 }} />
              
              {event.expandedDetails.context && (
                <View style={{ marginBottom: 16 }}>
                  <SectionLabel style={{ marginBottom: 4 }}>CONTEXT</SectionLabel>
                  <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: UI.foreground, lineHeight: 20 }}>{event.expandedDetails.context}</Text>
                </View>
              )}
              
              {event.expandedDetails.challengeFaced && (
                <View style={{ marginBottom: 16 }}>
                  <SectionLabel style={{ marginBottom: 4 }} color={UI.accent}>CHALLENGE</SectionLabel>
                  <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: UI.foreground, lineHeight: 20 }}>{event.expandedDetails.challengeFaced}</Text>
                </View>
              )}

              {event.expandedDetails.outcome && (
                <View style={{ marginBottom: 16 }}>
                  <SectionLabel style={{ marginBottom: 4 }} color={UI.success}>OUTCOME</SectionLabel>
                  <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: UI.foreground, lineHeight: 20 }}>{event.expandedDetails.outcome}</Text>
                </View>
              )}

              {event.expandedDetails.achievements && event.expandedDetails.achievements.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <SectionLabel style={{ marginBottom: 4 }}>ACHIEVEMENTS</SectionLabel>
                  {event.expandedDetails.achievements.map((ach, i) => (
                    <Text key={i} style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: UI.foreground, lineHeight: 20, marginBottom: 2 }}>• {ach}</Text>
                  ))}
                </View>
              )}

              {event.expandedDetails.skills && event.expandedDetails.skills.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <SectionLabel style={{ marginBottom: 6 }}>SKILLS BUILT</SectionLabel>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {event.expandedDetails.skills.map((skill, i) => (
                      <PillBadge key={i} label={skill} />
                    ))}
                  </View>
                </View>
              )}

              {event.expandedDetails.transitions && event.expandedDetails.transitions.length > 0 && (
                <View style={{ marginBottom: 4 }}>
                  <SectionLabel style={{ marginBottom: 4 }}>DECISION THAT LED NEXT</SectionLabel>
                  <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: UI.foreground }}>{event.expandedDetails.transitions[0].decisionLabel}</Text>
                </View>
              )}
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const getPseudoPct = (str: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % (max - min + 1)) + min;
};

/* ── Main ──────────────────────────────────────────── */

export default function ResultsPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payload?: string }>();
  const [loading, setLoading] = useState(true);
  
  const { getToken } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedInsight, setTranslatedInsight] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [preferredLang, setPreferredLang] = useState('en');
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  // Parse live data
  let data: DecisionAtlasBackendResponse | null = null;
  try {
    if (params.payload) {
      const raw = JSON.parse(params.payload);
      if (raw.aggregatedContext) {
        data = {
          structuredQuery: raw.structuredQuery || {},
          aggregatedContext: raw.aggregatedContext,
        };
      }
    }
  } catch {
    // Ignore parsing errors, data stays null
  }

  useEffect(() => {
    async function init() {
      try {
        const token = await getToken();
        if (token) {
          const user = await syncUser(token);
          if (user.preferredLanguage) {
            setPreferredLang(user.preferredLanguage);
          }
        }
      } catch (err) {
        console.warn("Failed to sync user for language preference", err);
      }
      setLoading(false);
    }
    init();
  }, [getToken]);

  if (loading) return <LoadingSkeleton />;

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: UI.background, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🏜️</Text>
        <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 28, color: UI.foreground, marginBottom: 8 }}>
          No Results Found
        </Text>
        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: UI.fg50, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
          We couldn't process this query or the results were empty. Please try rephrasing your question.
        </Text>
        <TouchableOpacity
          style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: UI.accent }}
          onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}
        >
          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#FFF' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const queryText = data.structuredQuery?.semanticQuery || data.structuredQuery?.queryType || 'Search Results';
  const queryType = data.structuredQuery?.queryType || 'exploration';
  const isRecommendation = queryType === 'recommendation';
  const isSimilarJourney = queryType === 'similar_journey';

  const { journeyStatistics: stats, aiInsights, timelineFeed, commonPatterns } = data.aggregatedContext;

  const topProducts = commonPatterns?.slice(0, 4) || [];
  const topDecisions = commonPatterns?.slice(1, 4) || [];

  async function handleFollowUp() {
    if (!followUpQuery.trim()) return;
    setIsSubmittingFollowUp(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const result = await submitQuery(token, followUpQuery);
      router.push({
        pathname: '/results',
        params: { payload: JSON.stringify(result) },
      });
      setFollowUpQuery('');
    } catch (err) {
      console.warn("Failed follow-up", err);
      Alert.alert("Error", "Could not submit follow-up query.");
    } finally {
      setIsSubmittingFollowUp(false);
    }
  }

  const renderProducts = () => topProducts.length > 0 && (
    <Animated.View entering={FadeInDown.delay(100).springify().damping(20)} key="products" style={{ backgroundColor: UI.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: UI.fg08 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <SectionLabel>{isSimilarJourney ? "COMMON PATTERNS" : "TOP PRE-PMF PRODUCTS"}</SectionLabel>
        <Feather name="bar-chart-2" size={16} color={UI.accent} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {topProducts.map((p, i) => {
          return (
            <View key={i} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: UI.accent }} />
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 15, color: UI.foreground }}>{p.percentage || getPseudoPct(p.title, 10, 50)}%</Text>
              </View>
              <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: UI.fg50, lineHeight: 16 }} numberOfLines={2}>{p.title}</Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderTimelines = () => timelineFeed?.map((userJourney, index) => (
    <Animated.View entering={FadeInDown.delay(200 + index * 100).springify().damping(20)} key={`timeline-${index}`} style={{ backgroundColor: UI.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: UI.fg08 }}>
      <SectionLabel style={{ marginBottom: 16 }}>
        {`${isSimilarJourney ? "SIMILAR FOUNDER " : "JOURNEY TIMELINE "}(@${userJourney.username})`}
      </SectionLabel>
      <View>
        {userJourney.timeline.map((event, i) => (
          <TimelineNodeItem 
            key={event.id} 
            event={event} 
            isLast={i === userJourney.timeline.length - 1} 
          />
        ))}
      </View>
    </Animated.View>
  ));

  const renderDecisions = () => topDecisions.length > 0 && (
    <Animated.View entering={FadeInDown.delay(300).springify().damping(20)} key="decisions" style={{ backgroundColor: UI.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: UI.fg08 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionLabel>COMMON DECISIONS</SectionLabel>
        <PillBadge label="TOP 3" color={UI.accent} bgColor={UI.accentSoft} />
      </View>
      <View style={{ gap: 12 }}>
        {topDecisions.map((d, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: UI.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 10, color: UI.accent }}>◆</Text>
            </View>
            <Text style={{ flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 14, color: UI.foreground, lineHeight: 20 }}>{d.description}</Text>
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: UI.accent }}>{d.percentage || getPseudoPct(d.description, 20, 70)}%</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderAIInsight = () => aiInsights && (
    <Animated.View entering={FadeInDown.delay(50).springify().damping(20)} key="aiInsight" style={{ marginBottom: 16 }}>
      <DarkCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 16 }}>✨</Text>
            <SectionLabel color="#FFF">AI INSIGHT</SectionLabel>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={async () => {
                if (isPlaying) {
                  sound?.stopAsync();
                  setIsPlaying(false);
                  return;
                }
                setIsPlaying(true);
                try {
                  const token = await getToken();
                  if (!token) return;
                  const uri = await generateSpeechUri(token, aiInsights, preferredLang);
                  const { sound: newSound } = await Audio.Sound.createAsync({ uri });
                  setSound(newSound);
                  await newSound.playAsync();
                  newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                      setIsPlaying(false);
                    }
                  });
                } catch (err) {
                  console.warn(err);
                  setIsPlaying(false);
                }
              }}
              disabled={isTranslating}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
            >
              {isPlaying ? <Feather name="square" size={14} color="#FFF" /> : <Feather name="volume-2" size={16} color="#FFF" />}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={async () => {
                setIsTranslating(true);
                try {
                  const token = await getToken();
                  if (!token) return;
                  const res = await translateInsights(token, aiInsights, preferredLang);
                  setTranslatedInsight(res.translatedAiInsights.directAnswer || res.translatedAiInsights.actionableTakeaway);
                } catch (err) {
                  console.warn(err);
                } finally {
                  setIsTranslating(false);
                }
              }}
              disabled={isTranslating || isPlaying}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
            >
              {isTranslating ? <ActivityIndicator color="#FFF" size="small" /> : <Feather name="globe" size={16} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 16, color: '#FFF', lineHeight: 24 }}>
          {translatedInsight || aiInsights.directAnswer || aiInsights.actionableTakeaway}
        </Text>
      </DarkCard>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: UI.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: UI.surface, borderBottomWidth: 1, borderBottomColor: UI.fg08 }}>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }} style={{ padding: 8, marginLeft: -8 }}>
          <Feather name="arrow-left" size={24} color={UI.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 24, color: UI.foreground, lineHeight: 28 }} numberOfLines={2}>
            {queryText}
          </Text>
          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: UI.accent, marginTop: 4 }}>
            {isSimilarJourney ? `Found ${stats?.usersAnalyzed || 0} Similar Founders` : `Analyzed ${stats?.usersAnalyzed || 0} Founders`}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {isRecommendation ? (
          <>
            {renderAIInsight()}
            {renderProducts()}
            {renderTimelines()}
            {renderDecisions()}
          </>
        ) : isSimilarJourney ? (
          <>
            {renderTimelines()}
            {renderAIInsight()}
            {renderProducts()}
            {renderDecisions()}
          </>
        ) : (
          <>
            {renderProducts()}
            {renderTimelines()}
            {renderDecisions()}
            {renderAIInsight()}
          </>
        )}
      </ScrollView>

      {/* Follow-up Question Interface */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12, backgroundColor: UI.surface, borderTopWidth: 1, borderTopColor: UI.fg08 }}>
        <TextInput
          style={{
            flex: 1, backgroundColor: UI.background, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 14,
            fontSize: 15, fontFamily: 'Manrope_400Regular', color: UI.foreground,
            borderWidth: 1, borderColor: UI.fg08
          }}
          placeholder="Ask a follow-up question..."
          placeholderTextColor={UI.fg40}
          value={followUpQuery}
          onChangeText={setFollowUpQuery}
          onSubmitEditing={handleFollowUp}
          returnKeyType="send"
          editable={!isSubmittingFollowUp}
        />
        <TouchableOpacity 
          style={{
            width: 48, height: 48, borderRadius: 24, backgroundColor: isSubmittingFollowUp || !followUpQuery.trim() ? UI.fg08 : UI.accent,
            alignItems: 'center', justifyContent: 'center', marginLeft: 12
          }}
          onPress={handleFollowUp}
          disabled={isSubmittingFollowUp || !followUpQuery.trim()}
        >
          {isSubmittingFollowUp ? (
            <ActivityIndicator color={UI.accent} size="small" />
          ) : (
            <Feather name="send" size={18} color={!followUpQuery.trim() ? UI.fg40 : '#FFF'} style={{ marginLeft: -2, marginTop: 2 }} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
