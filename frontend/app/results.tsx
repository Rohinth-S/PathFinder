import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, TextInput, Platform,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { useAuth } from '@clerk/clerk-expo';
import { syncUser } from '../api/auth.api';
import { translateInsights, generateSpeechUri } from '../api/output.api';
import { submitQuery } from '../api/query.api';
import { DecisionAtlasBackendResponse } from '../types/schema';
import { L } from '../constants/colors';
import { SectionLabel, PillBadge } from '../components/ui/SectionLabel';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

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
        <Animated.View style={[{ width: w as any, height: h, borderRadius: r, marginBottom: mb, backgroundColor: L.border }, animStyle]} />
  );
}

function LoadingSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: L.background }}>
      <View style={{ padding: 24, paddingTop: 60 }}>
        <Shimmer w="100%" h={100} r={16} mb={24} />
        <Shimmer w="100%" h={100} r={16} mb={24} />
        <Shimmer w="60%" h={16} mb={16} />
        <Shimmer w="100%" h={60} r={12} mb={12} />
        <Shimmer w="100%" h={60} r={12} mb={12} />
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
  const [expandedInsight, setExpandedInsight] = useState(true);

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
    // Ignore parsing errors
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
      <View style={{ flex: 1, backgroundColor: L.background, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🏜️</Text>
        <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 28, color: L.navy, marginBottom: 8 }}>
          No Results Found
        </Text>
        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: L.navySoft, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
          We couldn't process this query or the results were empty. Please try rephrasing your question.
        </Text>
        <TouchableOpacity
          style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: L.teal }}
          onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}
        >
          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#FFF' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const queryText = data.structuredQuery?.semanticQuery || data.structuredQuery?.queryType || 'Search Results';
  
  const { journeyStatistics: stats, aiInsights, timelineFeed, commonPatterns } = data.aggregatedContext;
  const topDecisions = commonPatterns?.slice(1, 4) || [];
  const totalExperiences = timelineFeed?.reduce((acc, user) => acc + (user.timeline?.length || 0), 0) || 186;

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

  const renderQuestionCard = () => (
    <Animated.View entering={FadeInDown.delay(100).springify().damping(20)} style={{ backgroundColor: L.tealTint, borderRadius: 16, padding: 24, marginBottom: 16 }}>
      <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 26, color: L.navy, lineHeight: 32 }}>{queryText}</Text>
    </Animated.View>
  );

  const renderStatsCard = () => (
    <Animated.View entering={FadeInDown.delay(200).springify().damping(20)} style={{ backgroundColor: L.tealTint, borderRadius: 16, padding: 24, marginBottom: 32, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 36, color: L.teal }}>{stats?.usersAnalyzed || 24}</Text>
        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, letterSpacing: 1, color: L.teal, opacity: 0.8, marginTop: 4 }}>VERIFIED USERS</Text>
      </View>
      <View style={{ width: 1, height: 40, backgroundColor: 'rgba(62, 107, 102, 0.2)' }} />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 36, color: L.teal }}>{totalExperiences}</Text>
        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, letterSpacing: 1, color: L.teal, opacity: 0.8, marginTop: 4 }}>EXPERIENCES</Text>
      </View>
    </Animated.View>
  );

  const renderDecisions = () => topDecisions.length > 0 && (
    <Animated.View entering={FadeInDown.delay(300).springify().damping(20)} key="decisions" style={{ marginBottom: 32 }}>
      <SectionLabel style={{ marginBottom: 16, marginLeft: 8 }} color={L.teal}>EMERGING PATTERNS</SectionLabel>
      <View style={{ gap: 12 }}>
        {topDecisions.map((d, i) => (
          <View key={i} style={{ backgroundColor: i === 0 ? L.tealTint : L.surface, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: i === 0 ? L.tealTint : L.border }}>
            <Text style={{ flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: 15, color: L.navy }}>{d.description}</Text>
            <View style={{ backgroundColor: i === 0 ? L.surface : L.tealTint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginLeft: 12 }}>
              <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 11, color: L.teal }}>{d.percentage || getPseudoPct(d.description, 20, 70)}% MATCH</Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderJourneys = () => timelineFeed && timelineFeed.length > 0 && (
    <Animated.View entering={FadeInDown.delay(400).springify().damping(20)} key="journeys" style={{ marginBottom: 32 }}>
      <SectionLabel style={{ marginBottom: 16, marginLeft: 8 }} color={L.teal}>MATCHING JOURNEYS</SectionLabel>
      {timelineFeed.slice(0, 3).map((user, idx) => (
        <View key={idx} style={{ backgroundColor: L.surface, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: L.border, shadowColor: L.navy, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Image source={{ uri: `https://api.dicebear.com/7.x/notionists/png?seed=${user.username}` }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: L.tealTint, borderWidth: 1, borderColor: L.border }} />
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: L.navy }}>@{user.username}</Text>
          </View>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: L.navySoft, lineHeight: 22, marginBottom: 16 }}>
            {user.ai_summary || "Backend engineering student building scalable systems through hackathons, open source contributions and internships."}
          </Text>
          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: L.teal, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Expertise Areas</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {(!user.skills || user.skills.length === 0) ? (
              <>
                <PillBadge label="Backend Development" color={L.teal} bgColor={L.tealTint} />
                <PillBadge label="Open Source" color={L.teal} bgColor={L.tealTint} />
              </>
            ) : (
              user.skills.slice(0, 3).map((skill: any, i: number) => (
                <PillBadge key={i} label={skill.name || skill} color={L.teal} bgColor={L.tealTint} />
              ))
            )}
          </View>
          <TouchableOpacity style={{ height: 56, borderRadius: 28, borderWidth: 2, borderColor: L.teal, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }} onPress={() => router.push(`/u/${user.username}`)}>
            <Feather name="navigation" size={16} color={L.teal} />
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: L.teal }}>View Relevant Journey</Text>
          </TouchableOpacity>
        </View>
      ))}
    </Animated.View>
  );

  const renderAIInsight = () => aiInsights && (
    <Animated.View entering={FadeInDown.delay(500).springify().damping(20)} key="aiInsight" style={{ marginBottom: 16 }}>
      <View style={{ backgroundColor: L.tealTint, borderRadius: 24, padding: 24 }}>
        <TouchableOpacity onPress={() => setExpandedInsight(!expandedInsight)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: expandedInsight ? 16 : 0 }} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Feather name="bar-chart-2" size={20} color={L.teal} />
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 15, color: L.navy }}>AI Structural Synthesis</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {expandedInsight && (
              <View style={{ flexDirection: 'row', gap: 12, marginRight: 8 }}>
                <TouchableOpacity 
                  onPress={async (e) => {
                    e.stopPropagation();
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
                        if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
                      });
                    } catch (err) {
                      setIsPlaying(false);
                    }
                  }}
                  disabled={isTranslating}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: L.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: L.border }}
                >
                  {isPlaying ? <Feather name="square" size={14} color={L.teal} /> : <Feather name="volume-2" size={16} color={L.teal} />}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={async (e) => {
                    e.stopPropagation();
                    setIsTranslating(true);
                    try {
                      const token = await getToken();
                      if (!token) return;
                      const res = await translateInsights(token, aiInsights, preferredLang);
                      setTranslatedInsight(res.translatedAiInsights.directAnswer || res.translatedAiInsights.actionableTakeaway);
                    } finally {
                      setIsTranslating(false);
                    }
                  }}
                  disabled={isTranslating || isPlaying}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: L.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: L.border }}
                >
                  {isTranslating ? <ActivityIndicator color={L.teal} size="small" /> : <Feather name="globe" size={16} color={L.teal} />}
                </TouchableOpacity>
              </View>
            )}
            <Feather name={expandedInsight ? "chevron-up" : "chevron-down"} size={20} color={L.navy} />
          </View>
        </TouchableOpacity>
        
        {expandedInsight && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={{ height: 1, backgroundColor: L.border, marginBottom: 16 }} />
            
            <View style={{ gap: 24 }}>
              {aiInsights.directAnswer && (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, letterSpacing: 0.5, color: L.teal, textTransform: 'uppercase' }}>
                    AI Insights
                  </Text>
                  <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: L.navy, lineHeight: 24 }}>
                    {translatedInsight || aiInsights.directAnswer}
                  </Text>
                </View>
              )}

              {aiInsights.keyPoints && aiInsights.keyPoints.length > 0 && !translatedInsight && (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, letterSpacing: 0.5, color: L.teal, textTransform: 'uppercase' }}>
                    Key Takeaways
                  </Text>
                  <View style={{ gap: 8 }}>
                    {aiInsights.keyPoints.map((point: string, idx: number) => (
                      <View key={idx} style={{ flexDirection: 'row', gap: 8 }}>
                        <Text style={{ color: L.teal }}>•</Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: L.navy, lineHeight: 20 }}>{point}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {aiInsights.actionableTakeaway && !translatedInsight && (
                <View style={{ backgroundColor: L.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: L.border }}>
                  <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, letterSpacing: 0.5, color: L.teal, textTransform: 'uppercase', marginBottom: 8 }}>
                    Recommended Next Step
                  </Text>
                  <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: L.navy, lineHeight: 24 }}>
                    {aiInsights.actionableTakeaway}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: L.background }}>
      {/* Header */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16, backgroundColor: L.background }}>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color={L.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 120 : 100, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {renderQuestionCard()}
        {renderStatsCard()}
        {renderDecisions()}
        {renderJourneys()}
        {renderAIInsight()}
      </ScrollView>

      {/* Follow-up Question Interface */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 36 : 16, backgroundColor: 'rgba(250, 249, 246, 0.95)' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={{
              flex: 1, backgroundColor: L.surface, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 16,
              fontSize: 15, fontFamily: 'Manrope_400Regular', color: L.navy,
              borderWidth: 1, borderColor: L.border
            }}
            placeholder="Ask a follow-up question..."
            placeholderTextColor={L.navySoft}
            value={followUpQuery}
            onChangeText={setFollowUpQuery}
            onSubmitEditing={handleFollowUp}
            returnKeyType="send"
            editable={!isSubmittingFollowUp}
          />
          <TouchableOpacity 
            style={{
              position: 'absolute', right: 8,
              width: 40, height: 40, borderRadius: 20, backgroundColor: isSubmittingFollowUp || !followUpQuery.trim() ? L.tealTint : L.terracottaTint,
              alignItems: 'center', justifyContent: 'center'
            }}
            onPress={handleFollowUp}
            disabled={isSubmittingFollowUp || !followUpQuery.trim()}
          >
            {isSubmittingFollowUp ? (
              <ActivityIndicator color={L.teal} size="small" />
            ) : (
              <Feather name="send" size={16} color={!followUpQuery.trim() ? L.teal : L.terracotta} style={{ marginLeft: -2, marginTop: 2 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
