import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { useAuth } from '@clerk/clerk-expo';
import { submitQuery } from '../../api/query.api';
import { L } from '../../constants/colors';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { GradientButton } from '../../components/ui/GradientButton';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming,
  FadeInDown, FadeInUp,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

const SUGGESTED_QUESTIONS = [
  'What should I do after my current experience?',
  'How did others prepare for Google STEP?',
  'Summarize my journey so far.',
  'Find mentorship opportunities.',
];

export default function QueryPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Pulse animation for recording
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.6, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ), -1, false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.1, { duration: 800 }),
          withTiming(0.4, { duration: 800 }),
        ), -1, false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
      pulseOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  /* ── Audio Recording ──────────────────────────────── */

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant microphone access to use voice search.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
    } catch (err) {
      console.warn('Failed to start recording', err);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    setIsRecording(false);

    if (!recording) {
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        handleSubmit(null, uri);
      }
    } catch (error) {
      console.warn('Failed to stop recording', error);
      setRecording(null);
    }
  }

  /* ── Submit Handler ───────────────────────────────── */

  async function handleSubmit(searchText?: string | null, audioUri?: string | null) {
    const text = searchText ?? query;
    if (!text?.trim() && !audioUri) return;

    setIsSearching(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const result = await submitQuery(token, text, audioUri);

      // If the backend transcribed audio, show it
      if (result.transcribed && result.query) {
        setQuery(result.query);
      }

      router.push({
        pathname: '/results',
        params: { payload: JSON.stringify(result) },
      });
    } catch (error) {
      console.warn('Query Pipeline Error:', error);
      Alert.alert(
        'Connection Error',
        'Could not reach the backend. Please ensure the server is running and try again.'
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleSuggestionPress(suggestion: string) {
    setQuery(suggestion);
    handleSubmit(suggestion);
  }

  /* ── UI ────────────────────────────────────────────── */

  return (
    <View style={{ flex: 1, backgroundColor: L.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500).springify()}
          style={{ paddingTop: 64, paddingHorizontal: 24, alignItems: 'flex-start', marginBottom: 8 }}
        >
          <Text style={{
            fontFamily: 'Manrope_700Bold',
            fontSize: 26,
            lineHeight: 32,
            letterSpacing: -0.5,
            color: L.navy,
            marginBottom: 12,
          }}>
            Ask Anything
          </Text>
          <Text style={{
            fontFamily: 'Manrope_400Regular',
            fontSize: 15,
            lineHeight: 22,
            color: L.navySoft,
            maxWidth: '100%',
          }}>
            Ask questions about your journey, learn from similar people's experiences, or get AI-powered guidance.
          </Text>
        </Animated.View>

        {/* Query Input Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500).springify()}
          style={{ paddingHorizontal: 24, marginTop: 28 }}
        >
          <View style={{
            backgroundColor: L.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isFocused ? L.teal : L.border,
            overflow: 'hidden',
          }}>
            {/* Text area */}
            <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
              <TextInput
                style={{
                  fontSize: 15,
                  color: L.navy,
                  fontFamily: 'Manrope_400Regular',
                  minHeight: 100,
                  textAlignVertical: 'top',
                  lineHeight: 22,
                }}
                placeholder="Ask anything about your journey..."
                placeholderTextColor={L.navySoft}
                value={query}
                onChangeText={setQuery}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                multiline
                editable={!isSearching}
              />
            </View>

            {/* Bottom toolbar */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: L.border,
            }}>
              {/* Mic button */}
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {isRecording && (
                  <Animated.View
                    style={[
                      pulseStyle,
                      {
                        position: 'absolute',
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: L.terracottaTint,
                        borderWidth: 1.5,
                        borderColor: L.terracotta,
                      },
                    ]}
                  />
                )}
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={isSearching}
                  activeOpacity={0.7}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isRecording ? L.terracotta : L.tealTint,
                  }}
                >
                  <Feather
                    name={isRecording ? 'square' : 'mic'}
                    size={16}
                    color={isRecording ? '#FFF' : L.teal}
                  />
                </TouchableOpacity>
              </View>

              {/* Recording indicator */}
              {isRecording && (
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: L.terracotta }} />
                  <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: L.terracotta, letterSpacing: 0.5 }}>
                    Listening...
                  </Text>
                </View>
              )}

              {/* Send button */}
              <TouchableOpacity
                onPress={() => {
                  if (isRecording) {
                    stopRecording();
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={isSearching || (!query.trim() && !isRecording)}
                activeOpacity={0.7}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: (!query.trim() && !isRecording) ? L.tealTint : L.teal,
                }}
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Feather
                    name="arrow-up"
                    size={18}
                    color={(!query.trim() && !isRecording) ? L.teal : '#FFFFFF'}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Suggested Questions */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(500).springify()}
          style={{ paddingHorizontal: 24, marginTop: 36 }}
        >
          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: L.teal, marginBottom: 16 }}>
            SUGGESTED QUESTIONS
          </Text>

          <View style={{ gap: 10 }}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(400 + i * 80).duration(400).springify()}>
                <TouchableOpacity
                  onPress={() => handleSuggestionPress(q)}
                  disabled={isSearching}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: L.surface,
                    borderRadius: 16,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: L.border,
                  }}
                >
                  <View style={{
                    width: 28, height: 28, borderRadius: 8,
                    backgroundColor: L.tealTint,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Feather name="zap" size={14} color={L.teal} />
                  </View>
                  <Text style={{
                    flex: 1,
                    fontFamily: 'Manrope_400Regular',
                    fontSize: 14,
                    lineHeight: 20,
                    color: L.navy,
                  }}>
                    {q}
                  </Text>
                  <Feather name="arrow-up-right" size={14} color={L.navySoft} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
