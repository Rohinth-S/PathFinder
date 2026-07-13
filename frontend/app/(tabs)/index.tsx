import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { useAuth } from '@clerk/clerk-expo';
import { submitQuery } from '../../api/query.api';
import { UI } from '../../constants/colors';
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
  const [intent, setIntent] = useState<'exploring' | 'myself'>('exploring');

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
    <View style={{ flex: 1, backgroundColor: UI.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 }}>
          <TouchableOpacity
            onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
          >
            <Feather name="arrow-left" size={20} color={UI.foreground} />
          </TouchableOpacity>
          <SectionLabel>Ask PathFinder</SectionLabel>
          <View style={{ width: 40 }} />
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
          {/* Editorial Headline */}
          <Text style={{
            fontFamily: 'InstrumentSerif_400Regular',
            fontSize: 36,
            lineHeight: 42,
            letterSpacing: -0.5,
            color: UI.foreground,
            marginBottom: 32,
          }}>
            What do you want{'\n'}to learn from{'\n'}real journeys?
          </Text>

          {/* Intent Toggle — pill segments */}
          <View style={{
            flexDirection: 'row', backgroundColor: '#ECFDF5', borderRadius: 12,
            padding: 4, marginBottom: 20, borderWidth: 1, borderColor: UI.successTint,
            gap: 4,
          }}>
            {(['exploring', 'myself'] as const).map((opt) => {
              const active = intent === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setIntent(opt)}
                  style={{
                    flex: 1, paddingVertical: 10, alignItems: 'center',
                    borderRadius: 8,
                    backgroundColor: active ? UI.success : 'transparent',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather 
                      name={opt === 'exploring' ? 'search' : 'target'} 
                      size={14} 
                      color={active ? '#FFFFFF' : UI.success} 
                    />
                    <Text style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 13,
                      color: active ? '#FFFFFF' : UI.success,
                      letterSpacing: 0.3,
                    }}>
                      {opt === 'exploring' ? 'Exploring' : 'For Myself'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Input Card */}
          <View style={{
            backgroundColor: '#ECFDF5', borderRadius: 16,
            borderWidth: 1, borderColor: UI.successTint,
            flexDirection: 'row', alignItems: 'flex-end',
            paddingRight: 8, paddingBottom: 8,
            marginBottom: 12,
          }}>
            <TextInput
              style={{
                flex: 1, fontSize: 15, color: UI.foreground,
                padding: 16, minHeight: 100,
                textAlignVertical: 'top',
                fontFamily: 'Inter_400Regular',
              }}
              placeholder="e.g. Should I drop out to build a startup?"
              placeholderTextColor={UI.success}
              value={query}
              onChangeText={setQuery}
              multiline
              editable={!isSearching}
            />
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 48, height: 48 }}>
              {/* Pulse ring */}
              {isRecording && (
                <Animated.View
                  style={[
                    pulseStyle,
                    {
                      position: 'absolute',
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: UI.successTint,
                      borderWidth: 1.5,
                      borderColor: `${UI.success}40`,
                    },
                  ]}
                />
              )}
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isSearching}
                style={{
                  width: 44, height: 44, borderRadius: 22,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isRecording ? UI.success : UI.surfaceDim,
                }}
              >
                <Feather
                  name={isRecording ? 'square' : 'mic'}
                  size={18}
                  color={isRecording ? '#FFF' : UI.fg50}
                />
              </TouchableOpacity>
            </View>
          </View>

          {isRecording && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: UI.success }} />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: UI.success, letterSpacing: 0.5 }}>
                Listening... tap to stop
              </Text>
            </View>
          )}

          {/* Submit */}
          <GradientButton
            label={isSearching ? 'Searching pathways...' : 'Search Pathways'}
            onPress={() => handleSubmit()}
            loading={isSearching}
            disabled={isSearching || (!query.trim() && !isRecording)}
            size="lg"
            style={{ alignSelf: 'stretch' }}
          />
        </View>

        {/* Suggested Questions */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(500).springify()}
          style={{ paddingHorizontal: 24, marginTop: 48 }}
        >
          <SectionLabel color={UI.success} style={{ marginBottom: 16 }}>SUGGESTED QUESTIONS</SectionLabel>

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
                    backgroundColor: '#ECFDF5',
                    borderRadius: 16,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: UI.successTint,
                  }}
                >
                  <View style={{
                    width: 28, height: 28, borderRadius: 8,
                    backgroundColor: UI.successTint,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Feather name="zap" size={14} color={UI.success} />
                  </View>
                  <Text style={{
                    flex: 1,
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    lineHeight: 20,
                    color: UI.fg80,
                  }}>
                    {q}
                  </Text>
                  <Feather name="arrow-up-right" size={14} color={UI.fg40} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
