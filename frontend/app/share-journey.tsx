import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput,
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

const MOCK_FOLLOW_UPS = [
  "That's fascinating! How did you transition from that into your next role?",
  "I see. What were the most valuable skills you picked up during that phase?",
  "Makes sense. Did you have any specific mentors or key people who influenced you then?",
  "Interesting! That connects to a pattern I'm seeing. What happened next in your career?",
  "Wow, that must have been quite an experience. What was the turning point for your next big step?",
  "Got it. Looking back, what is the one thing you would have done differently at that stage?",
  "That sounds like a defining moment. How did that shape your long-term goals?"
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
    
    // Count how many user messages exist to pick a sequential follow-up
    const userMessageCount = messages.filter(m => m.sender === 'user').length;
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setGraphNodes(prev => prev + 1);

    // Mock AI response after short delay
    setTimeout(() => {
      const followUpText = MOCK_FOLLOW_UPS[userMessageCount % MOCK_FOLLOW_UPS.length];
      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: followUpText,
      };
      setMessages(prev => [...prev, aiReply]);
      setGraphNodes(prev => prev + 1);
    }, 1200);
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
          <Text className="text-xs">🧩</Text>
          <Text className="text-xs font-bold text-brand-teal">Nodes: {graphNodes}</Text>
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
        />
        <TouchableOpacity className="w-10 h-10 rounded-full bg-brand-rust justify-center items-center" onPress={sendMessage}>
          <Text className="text-lg text-white">➤</Text>
        </TouchableOpacity>
      </View>

      {/* Finish Button */}
      <TouchableOpacity 
        className="bg-brand-navy mx-4 mb-4 py-3.5 rounded-xl items-center elevation-4 shadow-sm"
        onPress={() => router.replace('/dashboard')}
      >
        <Text className="text-brand-white text-base font-bold">Finish & Save Journey</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
