import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { extractJourney } from '../api/journey.api';
import { syncUser } from '../api/auth.api';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const AI_PROMPTS = [
  "Hey! I'm going to help build your Life Graph. Let's start with your career journey. 🚀\n\nTell me about your professional experiences — from your first role to where you are now. Include challenges, decisions, and turning points.",
  "Great, that's helpful! Can you tell me more about what challenges you faced and what decisions led you from one step to the next?",
  "Thanks! Any key achievements, skills you built, or moments of failure along the way? Those make your journey truly valuable.",
  "Almost there! Any final experiences or current goals you'd like to add before I build your Life Graph?",
];

export default function ShareJourneyPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: AI_PROMPTS[0] },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const userMessageCount = messages.filter(m => m.sender === 'user').length;

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Respond with next AI prompt if available
    const nextPromptIdx = userMessageCount + 1; // +1 because we just added one
    if (nextPromptIdx < AI_PROMPTS.length) {
      setTimeout(() => {
        const aiReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: AI_PROMPTS[nextPromptIdx],
        };
        setMessages(prev => [...prev, aiReply]);
      }, 800);
    }
  };

  const handleFinish = async () => {
    const userMessages = messages.filter(m => m.sender === 'user');
    if (userMessages.length === 0) {
      Alert.alert("Nothing to save", "Please share some of your journey first.");
      return;
    }

    setIsSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      // Get user info for context
      let userData: { username?: string } = {};
      try {
        const user = await syncUser(token);
        if (user.username) userData.username = user.username;
      } catch { /* proceed without username */ }

      // Combine all user messages into one journey narrative
      const journeyText = userMessages.map(m => m.text).join('\n\n');

      const result = await extractJourney(token, journeyText, userData);

      if (result.success) {
        const issueCount = result.staticAnalysis?.issues?.length || 0;
        Alert.alert(
          "Journey Saved! 🎉",
          issueCount > 0
            ? `Your journey has been extracted and saved. ${issueCount} suggestion(s) for improvement.`
            : "Your journey has been extracted and saved to your Life Graph.",
          [{ text: "View My Journey", onPress: () => router.replace('/(tabs)/history') }]
        );
      } else {
        Alert.alert("Extraction Issue", result.error || "Could not fully extract your journey. Try adding more details.");
      }
    } catch (err: any) {
      console.warn("Failed to save journey:", err);
      Alert.alert("Error", err?.message || "Failed to save your journey. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      className={`max-w-[80%] p-3.5 rounded-2xl ${
        item.sender === 'user'
          ? 'self-end bg-brand-teal rounded-br-sm'
          : 'self-start bg-brand-white border border-brand-border rounded-bl-sm'
      }`}
    >
      <Text
        className={`text-[15px] leading-[22px] ${
          item.sender === 'user' ? 'text-brand-white' : 'text-brand-slate'
        }`}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand-cream"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-5 border-b border-brand-border">
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }}>
          <Text className="text-[22px] text-brand-navy">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-brand-navy">Share Your Journey</Text>
        <View className="flex-row items-center gap-1 bg-brand-cream px-2.5 py-1.5 rounded-xl border border-brand-border">
          <Text className="text-xs">💬</Text>
          <Text className="text-xs font-bold text-brand-teal">{userMessageCount} messages</Text>
        </View>
      </View>

      {/* Chat */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerClassName="p-4 gap-3 pb-2"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Bar */}
      <View className="flex-row items-center p-3 gap-2 border-t border-brand-border bg-brand-white">
        <TouchableOpacity
          className={`w-10 h-10 rounded-full justify-center items-center ${isRecording ? 'bg-brand-tan' : 'bg-brand-cream'}`}
          onPress={() => setIsRecording(!isRecording)}
        >
          <Text className="text-lg">{isRecording ? '⏹️' : '🎤'}</Text>
        </TouchableOpacity>
        <TextInput
          className="flex-1 bg-brand-cream rounded-full px-4 py-2.5 text-[15px] text-brand-navy max-h-20"
          placeholder={isRecording ? 'Recording...' : 'Type your experience...'}
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!isSaving}
        />
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-brand-rust justify-center items-center"
          onPress={sendMessage}
          disabled={isSaving}
        >
          <Text className="text-lg text-white">➤</Text>
        </TouchableOpacity>
      </View>

      {/* Finish Button */}
      <TouchableOpacity
        className={`bg-brand-navy mx-4 mb-4 py-3.5 rounded-xl items-center elevation-4 shadow-sm ${isSaving ? 'opacity-60' : ''}`}
        onPress={handleFinish}
        disabled={isSaving}
      >
        {isSaving ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text className="text-brand-white text-base font-bold">Extracting Journey...</Text>
          </View>
        ) : (
          <Text className="text-brand-white text-base font-bold">Finish & Save Journey</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
