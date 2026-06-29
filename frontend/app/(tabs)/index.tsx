import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Animated, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const MOCK_TRANSCRIPT = "I'm a CS grad, want to build a fintech startup, should I work first or start directly?";

export default function QueryPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [intent, setIntent] = useState<'exploring' | 'myself'>('exploring');
  const [isRecording, setIsRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isRecording) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
      return () => { pulseLoop.current?.stop(); };
    } else {
      pulseAnim.setValue(1);
      pulseLoop.current?.stop();
    }
  }, [isRecording, pulseAnim]);

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
      // Fallback: just do the mock pulse animation
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setQuery(MOCK_TRANSCRIPT);
      }, 3000);
    }
  }

  async function stopRecording() {
    setIsRecording(false);

    if (!recording) {
      // Fallback mode — no real recording, use mock text
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
      let response: Response;

      if (audioUri) {
        // Audio submission — multipart/form-data
        const formData = new FormData();
        formData.append('audio', {
          uri: audioUri,
          name: 'recording.m4a',
          type: 'audio/m4a',
        } as any);

        response = await fetch(`${API_BASE}/query`, {
          method: 'POST',
          body: formData,
          // NOTE: Do NOT set Content-Type — fetch sets multipart boundary automatically
        });
      } else {
        // Text submission — JSON
        response = await fetch(`${API_BASE}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text }),
        });
      }

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result = await response.json();

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
      // Fallback: navigate with no payload (results screen will use mock data)
      Alert.alert(
        'Connection Error',
        'Could not reach the backend. Showing demo results instead.',
        [
          { text: 'Show Demo', onPress: () => router.push('/results') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setIsSearching(false);
    }
  }

  /* ── UI ────────────────────────────────────────────── */

  return (
    <View className="flex-1 bg-brand-cream">
      <View className="flex-row items-center justify-between p-4 pt-5">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl text-brand-navy">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-brand-navy">Ask PathFinder</Text>
        <View style={{ width: 22 }} />
      </View>

      <View className="flex-1 p-6 justify-center">
        <Text className="text-3xl font-extrabold text-brand-navy leading-10 mb-7">What do you want{'\n'}to learn from{'\n'}real journeys?</Text>

        {/* Intent Toggle */}
        <View className="flex-row bg-brand-white rounded-xl p-1 mb-6 gap-1 border border-brand-border">
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-lg ${intent === 'exploring' ? 'bg-brand-teal' : ''}`}
            onPress={() => setIntent('exploring')}
          >
            <Text className={`font-semibold text-sm ${intent === 'exploring' ? 'text-brand-white' : 'text-brand-slate'}`}>
              🔍  Just Exploring
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-lg ${intent === 'myself' ? 'bg-brand-teal' : ''}`}
            onPress={() => setIntent('myself')}
          >
            <Text className={`font-semibold text-sm ${intent === 'myself' ? 'text-brand-white' : 'text-brand-slate'}`}>
              For Myself
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <View className="flex-row bg-brand-white rounded-2xl border-2 border-brand-border items-center pr-2 mb-3">
          <TextInput
            className="flex-1 text-brand-navy text-base p-4 min-h-[100px]"
            style={{ textAlignVertical: 'top' }}
            placeholder="e.g. Should I drop out to build a startup?"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            multiline
            editable={!isSearching}
          />
          <View className="justify-center items-center w-14 h-14 mr-1">
            {isRecording && (
              <Animated.View
                className="absolute w-12 h-12 rounded-full border-2"
                style={{
                  backgroundColor: 'rgba(208, 103, 87, 0.15)',
                  borderColor: 'rgba(208, 103, 87, 0.3)',
                  transform: [{ scale: pulseAnim }]
                }}
              />
            )}
            <TouchableOpacity
              className={`w-12 h-12 rounded-full justify-center items-center z-10 ${isRecording ? 'bg-brand-tan' : 'bg-brand-lightGray'}`}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isSearching}
            >
              <Text className="text-xl">{isRecording ? '⏹️' : '🎤'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isRecording && (
          <Text className="text-brand-rust text-center mb-3 font-bold text-sm">🔴  Listening... tap to stop</Text>
        )}

        {/* Submit */}
        <TouchableOpacity
          className={`bg-brand-rust py-4 rounded-2xl items-center mt-2 shadow-sm ${isSearching ? 'opacity-60' : ''}`}
          onPress={() => handleSubmit()}
          disabled={isSearching || (!query.trim() && !isRecording)}
        >
          {isSearching ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#FFF" size="small" />
              <Text className="text-brand-white text-base font-extrabold ml-2">Searching pathways...</Text>
            </View>
          ) : (
            <Text className="text-brand-white text-lg font-extrabold">Search Pathways  →</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

