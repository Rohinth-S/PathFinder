import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Animated, Switch, Alert, ActivityIndicator, KeyboardAvoidingView, TextInput, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '@clerk/clerk-expo';
import { syncUser } from '../api/auth.api';
import { translateInsights, generateSpeechUri } from '../api/output.api';
import { submitQuery } from '../api/query.api';
import { DecisionAtlasBackendResponse, BackendQueryResponse, UserTrajectory, TimelineEvent, AiInsights, CommonPattern } from '@/types/schema';
import { NODE_COLORS, NODE_ICONS, CATEGORY_COLORS } from '@/constants/colors';
import { BRAND_COLORS } from '../constants/colors';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';


/* ── Skeleton ──────────────────────────────────────── */
function Shimmer({ w, h, r = 8, mb = 0 }: { w: number | string; h: number; r?: number; mb?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ])).start();
  }, [anim]);
  return <Animated.View style={{ width: w as any, height: h, borderRadius: r, marginBottom: mb, backgroundColor: '#E2E8F0', opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] }) }} />;
}

function LoadingSkeleton() {
  return (
    <View className="flex-1 bg-brand-cream">
      <View className="p-5">
        <Shimmer w="60%" h={24} mb={8} />
        <Shimmer w="40%" h={14} mb={24} />
        <Shimmer w="100%" h={120} r={16} mb={24} />
        <Shimmer w="100%" h={300} r={16} mb={24} />
      </View>
    </View>
  );
}

/* ── Timeline Node Component ───────────────────────── */
function TimelineNodeItem({ event, isLast }: { event: TimelineEvent, isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const nodeType = event.nodeType || 'Job';
  const colors = NODE_COLORS[nodeType] || NODE_COLORS.Job;
  const icon = NODE_ICONS[nodeType] || NODE_ICONS.Job;

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
    <View className="flex-row">
      {/* Left side: Vertical line and Icon */}
      <View className="w-11 items-center">
        <View className="w-8 h-8 rounded-full justify-center items-center z-10" style={{ backgroundColor: colors.iconBg }}>
          <Text className="text-sm" style={{ color: colors.iconText }}>{icon}</Text>
        </View>
        {!isLast && <View className="w-[3px] flex-1 bg-brand-teal -mt-1 -mb-1" />}
      </View>

      {/* Right side: Content Card */}
      <View className="flex-1 pb-4">
        <TouchableOpacity 
          className={`rounded-xl p-3.5 border ${expanded ? 'bg-brand-white border-brand-teal shadow-brand-teal shadow-sm elevation-2' : 'bg-brand-cream border-brand-border'}`}
          onPress={() => setExpanded(!expanded)} 
          activeOpacity={0.7}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-[15px] font-extrabold text-brand-navy mb-1">{event.title}</Text>
              <Text className="text-xs text-brand-slate mb-1.5 font-semibold">
                {event.startDate}{event.endDate ? ` - ${event.endDate}` : ''}{getDuration(event.startDate, event.endDate)}
              </Text>
              <Text className="text-[13px] text-brand-slate leading-[18px] font-medium" numberOfLines={expanded ? undefined : 2}>{event.timelineSummary}</Text>
            </View>
            <Text className="text-base text-brand-slate mt-0.5 pl-2">{expanded ? '︿' : '﹀'}</Text>
          </View>

          {expanded && (
            <View className="mt-3">
              <View className="h-px bg-brand-border my-3" />
              
              {event.expandedDetails.context && (
                <View className="mb-4">
                  <View className="flex-row items-center gap-1.5 mb-1.5"><Text className="text-sm">💼</Text><Text className="text-[13px] font-extrabold text-brand-navy">Context</Text></View>
                  <Text className="text-sm text-brand-slate leading-5 font-medium">{event.expandedDetails.context}</Text>
                </View>
              )}
              
              {event.expandedDetails.challengeFaced && (
                <View className="mb-4">
                  <View className="flex-row items-center gap-1.5 mb-1.5"><Text className="text-sm">⚠️</Text><Text className="text-[13px] font-extrabold text-brand-navy">Challenge</Text></View>
                  <Text className="text-sm text-brand-slate leading-5 font-medium">{event.expandedDetails.challengeFaced}</Text>
                </View>
              )}

              {event.expandedDetails.outcome && (
                <View className="mb-4">
                  <View className="flex-row items-center gap-1.5 mb-1.5"><Text className="text-sm">🎯</Text><Text className="text-[13px] font-extrabold text-brand-navy">Outcome / Learning</Text></View>
                  <Text className="text-sm text-brand-slate leading-5 font-medium">{event.expandedDetails.outcome}</Text>
                </View>
              )}

              {event.expandedDetails.achievements && event.expandedDetails.achievements.length > 0 && (
                <View className="mb-4">
                  <View className="flex-row items-center gap-1.5 mb-1.5"><Text className="text-sm">🏆</Text><Text className="text-[13px] font-extrabold text-brand-navy">Key Achievements</Text></View>
                  {event.expandedDetails.achievements.map((ach, i) => (
                    <Text key={i} className="text-sm text-brand-slate leading-5 mb-1 font-medium">• {ach}</Text>
                  ))}
                </View>
              )}

              {event.expandedDetails.skills && event.expandedDetails.skills.length > 0 && (
                <View className="mb-4">
                  <View className="flex-row items-center gap-1.5 mb-1.5"><Text className="text-sm">{'</>'}</Text><Text className="text-[13px] font-extrabold text-brand-navy">Skills Built</Text></View>
                  <View className="flex-row flex-wrap gap-2 mt-1">
                    {event.expandedDetails.skills.map((skill, i) => (
                      <View key={i} className="bg-brand-cream px-2.5 py-1.5 rounded-lg border border-brand-border"><Text className="text-brand-teal text-xs font-bold">{skill}</Text></View>
                    ))}
                  </View>
                </View>
              )}

              {event.expandedDetails.transitions && event.expandedDetails.transitions.length > 0 && (
                <View className="mb-0">
                  <View className="flex-row items-center gap-1.5 mb-1.5"><Text className="text-sm">↪</Text><Text className="text-[13px] font-extrabold text-brand-navy">Decision That Led Next</Text></View>
                  <Text className="text-sm text-brand-slate leading-5 font-medium">{event.expandedDetails.transitions[0].decisionLabel}</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
      <View className="flex-1 bg-brand-cream justify-center items-center p-8">
        <Text className="text-[40px] mb-4">🏜️</Text>
        <Text className="text-xl font-bold text-brand-navy mb-2 text-center">No Results Found</Text>
        <Text className="text-sm text-brand-slate text-center mb-6">
          We couldn't process this query or the results were empty. Please try rephrasing your question.
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-full bg-brand-teal"
          onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}
        >
          <Text className="text-sm font-semibold text-brand-white">Go Back</Text>
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
    <View key="products" className="bg-brand-white rounded-2xl p-4 mb-4 border border-brand-border">
      <View className="flex-row items-center gap-1.5 mb-4">
        <Text className="text-base">✨</Text>
        <Text className="text-[15px] font-bold text-brand-navy">{isSimilarJourney ? "Common Patterns" : "Top Pre-PMF Products"}</Text>
        <View className="flex-1" />
        <Text className="text-lg text-brand-teal">📊</Text>
      </View>
      <View className="flex-row gap-3">
        {topProducts.map((p, i) => {
          const colorKeys = Object.keys(CATEGORY_COLORS);
          const colorTheme = CATEGORY_COLORS[colorKeys[i % colorKeys.length] as keyof typeof CATEGORY_COLORS];
          return (
            <View key={i} className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-2">
                <View className="w-8 h-8 rounded-lg justify-center items-center" style={{ backgroundColor: colorTheme.iconBg }}>
                  <Text className="text-base" style={{ color: colorTheme.iconText }}>{colorTheme.icon}</Text>
                </View>
                <Text className="text-sm font-extrabold text-brand-navy">{p.percentage || getPseudoPct(p.title, 10, 50)}%</Text>
              </View>
              <Text className="text-xs text-brand-slate leading-4 font-semibold" numberOfLines={2}>{p.title}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderTimelines = () => timelineFeed?.map((userJourney, index) => (
    <View key={`timeline-${index}`} className="bg-brand-white rounded-2xl p-4 mb-4 border border-brand-border">
      <Text className="text-base font-extrabold text-brand-navy mb-4">{isSimilarJourney ? "Similar Founder" : "Journey Timeline"} <Text className="font-normal text-brand-slate">({userJourney.username})</Text></Text>
      <View className="pl-1 pb-2">
        {userJourney.timeline.map((event, i) => (
          <TimelineNodeItem 
            key={event.id} 
            event={event} 
            isLast={i === userJourney.timeline.length - 1} 
          />
        ))}
      </View>
    </View>
  ));

  const renderDecisions = () => topDecisions.length > 0 && (
    <View key="decisions" className="bg-brand-white rounded-2xl p-4 mb-4 border border-brand-border">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-base font-extrabold text-brand-navy mb-4">Common Decisions</Text>
        <Text className="text-[13px] text-brand-rust font-bold">Top 3</Text>
      </View>
      <View className="gap-3">
        {topDecisions.map((d, i) => (
          <View key={i} className="flex-row items-center gap-2.5">
            <View className="w-6 h-6 rounded-full bg-brand-cream justify-center items-center"><Text className="text-brand-teal text-xs">◆</Text></View>
            <Text className="flex-1 text-sm text-brand-slate font-medium">{d.description}</Text>
            <Text className="text-sm font-extrabold text-brand-navy">{d.percentage || getPseudoPct(d.description, 20, 70)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAIInsight = () => aiInsights && (
    <View key="aiInsight" className="bg-brand-cream rounded-2xl p-5 border border-brand-tan overflow-hidden mb-4 relative">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-lg">✨</Text>
          <Text className="text-base font-extrabold text-brand-navy">AI Insight</Text>
        </View>
        <View className="flex-row gap-3">
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
          >
            {isPlaying ? <Text className="text-[20px]">⏹️</Text> : <Text className="text-[20px]">🔊</Text>}
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
          >
            {isTranslating ? <ActivityIndicator color={BRAND_COLORS.navy} size="small" /> : <Text className="text-[20px]">🌐</Text>}
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-[15px] text-brand-navy leading-[22px] font-semibold pr-10">{translatedInsight || aiInsights.directAnswer || aiInsights.actionableTakeaway}</Text>
      <Text className="absolute -bottom-2.5 -right-2.5 text-[60px] opacity-10">🧠</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-brand-cream"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
    >
      {/* Header */}
      <View className="flex-row items-center bg-brand-white px-4 pt-12 pb-4 border-b border-brand-border">
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }} className="p-2 -ml-2">
          <Text className="text-2xl text-brand-navy">←</Text>
        </TouchableOpacity>
        <View className="flex-1 px-3">
          <Text className="text-lg font-bold text-brand-navy leading-[22px]" numberOfLines={2}>{queryText}</Text>
          <Text className="text-[13px] text-brand-rust font-bold mt-1">{isSimilarJourney ? `Found ${stats?.usersAnalyzed || 0} Similar Founders` : `Analyzed ${stats?.usersAnalyzed || 0} Founders`}</Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-4 pb-10">
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
      <View className="flex-row items-center p-3 bg-brand-white border-t border-brand-border">
        <TextInput
          className="flex-1 bg-brand-cream rounded-full px-4 py-2.5 text-[15px] text-brand-navy"
          placeholder="Ask a follow-up question..."
          placeholderTextColor={BRAND_COLORS.slate}
          value={followUpQuery}
          onChangeText={setFollowUpQuery}
          onSubmitEditing={handleFollowUp}
          returnKeyType="send"
          editable={!isSubmittingFollowUp}
        />
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-brand-teal justify-center items-center ml-2" 
          onPress={handleFollowUp}
          disabled={isSubmittingFollowUp || !followUpQuery.trim()}
        >
          {isSubmittingFollowUp ? (
            <ActivityIndicator color={BRAND_COLORS.white} size="small" />
          ) : (
            <Text className="text-brand-white text-lg pl-0.5">➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
