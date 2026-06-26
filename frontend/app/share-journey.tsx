import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'ai', text: "Hey! I'm going to help build your Life Graph. Let's start with your career journey. 🚀\n\nWhat was your first professional experience?" },
  { id: '2', sender: 'user', text: 'I started as an Associate Software Engineer at TCS in 2019.' },
  { id: '3', sender: 'ai', text: "Great! TCS is a solid start. What was your primary goal when you started there? Were you focused on learning, earning, or building towards something specific?" },
  { id: '4', sender: 'user', text: 'Mostly learning. I wanted to understand how enterprise systems work at scale.' },
  { id: '5', sender: 'ai', text: "That's a strong foundation. What was the biggest challenge you faced during that time? Any moments that shifted your thinking?" },
];

export default function ShareJourneyPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [graphNodes, setGraphNodes] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setGraphNodes(prev => prev + 1);

    // Mock AI response after short delay
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Interesting! That connects to a pattern I'm seeing. What happened next in your career after that realization?",
      };
      setMessages(prev => [...prev, aiReply]);
      setGraphNodes(prev => prev + 1);
    }, 1200);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[s.bubble, item.sender === 'user' ? s.bubbleUser : s.bubbleAi]}>
      <Text style={[s.bubbleText, item.sender === 'user' && s.bubbleTextUser]}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Share Your Journey</Text>
        <View style={s.nodeBadge}>
          <Text style={s.nodeIcon}>🧩</Text>
          <Text style={s.nodeText}>Nodes: {graphNodes}</Text>
        </View>
      </View>

      {/* Chat */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={s.chatContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Bar */}
      <View style={s.inputBar}>
        <TouchableOpacity
          style={[s.micBtn, isRecording && s.micBtnRecording]}
          onPress={() => setIsRecording(!isRecording)}
        >
          <Text style={s.micEmoji}>{isRecording ? '⏹️' : '🎤'}</Text>
        </TouchableOpacity>
        <TextInput
          style={s.textInput}
          placeholder={isRecording ? 'Recording...' : 'Type your experience...'}
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={s.sendBtn} onPress={sendMessage}>
          <Text style={s.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* Finish Button */}
      <TouchableOpacity style={s.finishBtn} onPress={() => router.replace('/dashboard')}>
        <Text style={s.finishText}>Finish & Save Journey</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backArrow: { fontSize: 22, color: '#1E293B' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  nodeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE' },
  nodeIcon: { fontSize: 12 },
  nodeText: { fontSize: 12, fontWeight: '700', color: '#4338CA' },

  chatContent: { padding: 16, gap: 12, paddingBottom: 8 },
  bubble: { maxWidth: '80%', padding: 14, borderRadius: 16 },
  bubbleAi: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderBottomLeftRadius: 4 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#6366F1', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, color: '#334155', lineHeight: 22 },
  bubbleTextUser: { color: '#FFFFFF' },

  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  micBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  micBtnRecording: { backgroundColor: '#FEE2E2' },
  micEmoji: { fontSize: 18 },
  textInput: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#0F172A', maxHeight: 80 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  sendIcon: { fontSize: 18, color: '#FFFFFF' },

  finishBtn: { backgroundColor: '#10B981', marginHorizontal: 16, marginBottom: 16, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  finishText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
