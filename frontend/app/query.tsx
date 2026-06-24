import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';

const MOCK_TRANSCRIPT = "I'm a CS grad, want to build a fintech startup, should I work first or start directly?";

export default function QueryPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [intent, setIntent] = useState<'exploring' | 'myself'>('exploring');
  const [isRecording, setIsRecording] = useState(false);

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

      // Auto-stop after 3s and fill mock transcript
      const timer = setTimeout(() => {
        setIsRecording(false);
        setQuery(MOCK_TRANSCRIPT);
      }, 3000);
      return () => { clearTimeout(timer); pulseLoop.current?.stop(); };
    } else {
      pulseAnim.setValue(1);
      pulseLoop.current?.stop();
    }
  }, [isRecording, pulseAnim]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Ask PathFinder</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={s.body}>
        <Text style={s.heroText}>What do you want{'\n'}to learn from{'\n'}real journeys?</Text>

        {/* Intent Toggle */}
        <View style={s.toggleContainer}>
          <TouchableOpacity
            style={[s.toggleBtn, intent === 'exploring' && s.toggleBtnActive]}
            onPress={() => setIntent('exploring')}
          >
            <Text style={[s.toggleText, intent === 'exploring' && s.toggleTextActive]}>
              🔍  Just Exploring
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.toggleBtn, intent === 'myself' && s.toggleBtnActive]}
            onPress={() => setIntent('myself')}
          >
            <Text style={[s.toggleText, intent === 'myself' && s.toggleTextActive]}>
              🎯  For Myself
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <View style={s.inputWrapper}>
          <TextInput
            style={s.textInput}
            placeholder="e.g. Should I drop out to build a startup?"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            multiline
          />
          <View style={s.micArea}>
            {isRecording && (
              <Animated.View style={[s.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
            )}
            <TouchableOpacity
              style={[s.micButton, isRecording && s.micButtonRecording]}
              onPress={() => setIsRecording(!isRecording)}
            >
              <Text style={s.micIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isRecording && (
          <Text style={s.recordingLabel}>🔴  Listening... speak now</Text>
        )}

        {/* Submit */}
        <TouchableOpacity style={s.submitBtn} onPress={() => router.push('/results')}>
          <Text style={s.submitText}>Search Pathways  →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 20 },
  backArrow: { fontSize: 22, color: '#1E293B' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },

  body: { flex: 1, padding: 24, justifyContent: 'center' },
  heroText: { fontSize: 30, fontWeight: '800', color: '#0F172A', lineHeight: 38, marginBottom: 28 },

  toggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 24, gap: 4 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#6366F1' },
  toggleText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  toggleTextActive: { color: '#FFFFFF' },

  inputWrapper: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', paddingRight: 8, marginBottom: 12 },
  textInput: { flex: 1, color: '#0F172A', fontSize: 16, padding: 18, minHeight: 100, textAlignVertical: 'top' },

  micArea: { justifyContent: 'center', alignItems: 'center', width: 56, height: 56, marginRight: 4 },
  pulseRing: { position: 'absolute', width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 2, borderColor: 'rgba(239, 68, 68, 0.3)' },
  micButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  micButtonRecording: { backgroundColor: '#FEE2E2' },
  micIcon: { fontSize: 22 },
  recordingLabel: { color: '#EF4444', textAlign: 'center', marginBottom: 12, fontWeight: '600', fontSize: 14 },

  submitBtn: { backgroundColor: '#6366F1', paddingVertical: 18, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
