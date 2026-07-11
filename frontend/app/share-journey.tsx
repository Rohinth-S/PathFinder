import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, SafeAreaView, ScrollView, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { startJourneySession, sendJourneyMessage, submitJourney, submitJourneyGoal } from '../api/journey.api';
import { UI } from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function ShareJourneyPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'chat' | 'form'>('chat');
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [journeyDraft, setJourneyDraft] = useState<any>(null);
  const [editableExperiences, setEditableExperiences] = useState<any[]>([]);
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim()) return;
    setIsCreatingGoal(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await submitJourneyGoal(token, {
        title: newGoalTitle,
        description: newGoalDesc,
        status: "In Progress",
        topics: [],
        subtopics: [],
      });
      if (res.success) {
        setUserGoals(prev => [...prev, { id: res.id, title: res.title }]);
        setIsGoalModalVisible(false);
        setNewGoalTitle('');
        setNewGoalDesc('');
      }
    } catch (err) {
      Alert.alert("Error", "Could not create goal");
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExps = [...editableExperiences];
    newExps[index] = { ...newExps[index], [field]: value };
    setEditableExperiences(newExps);
  };

  useEffect(() => {
    async function initSession() {
      try {
        const token = await getToken();
        if (!token) throw new Error('Unauthenticated');
        const res = await startJourneySession(token);
        if (res.success && res.conversationId) {
          setConversationId(res.conversationId);
          setMessages([{ id: Date.now().toString(), text: res.message, sender: 'ai' }]);
        }
      } catch (err) {
        console.warn('Failed to start journey session', err);
      } finally {
        setIsInitializing(false);
      }
    }
    initSession();
  }, [getToken]);

  const sendMessage = async () => {
    if (!inputText.trim() || !conversationId) return;
    const userText = inputText;
    const userMsg: ChatMessage = { id: Date.now().toString(), text: userText, sender: 'user' };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      
      const res = await sendJourneyMessage(token, conversationId, userText);
      if (res.success) {
        setJourneyDraft(res.journeyDraft);
        setEditableExperiences(res.journeyDraft?.experiences || []);
        setUserGoals(res.journeyDraft?.goals || []);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'ai',
          text: "Got it! I've updated your journey draft. Keep telling me more, or switch to the Form view when you're ready to review."
        }]);
        setActiveTab('form');
      } else {
        throw new Error("Failed to process message");
      }
    } catch (err: any) {
      console.warn('Failed to send message:', err);
      Alert.alert("Error", "Could not process your message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!conversationId || editableExperiences.length === 0) {
      Alert.alert("Incomplete", "Please share your experiences in the chat first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      
      const payload = { ...journeyDraft, experiences: editableExperiences };
      const res = await submitJourney(token, conversationId, payload);
      if (res.success) {
        Alert.alert(
          "Journey Saved! 🎉",
          "Your experiences have been verified and added to your Life Graph.",
          [{ text: "View Graph", onPress: () => router.replace('/(tabs)/history') }]
        );
      } else {
        Alert.alert("Submission Issue", "Could not save your journey.");
      }
    } catch (err: any) {
      console.warn("Failed to submit journey:", err);
      Alert.alert("Error", err?.message || "Failed to submit. Check required fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <Animated.View
        entering={FadeInUp.duration(300)}
        layout={Layout.springify()}
        style={{
          maxWidth: '85%',
          padding: 16,
          borderRadius: 20,
          borderBottomRightRadius: isUser ? 4 : 20,
          borderBottomLeftRadius: !isUser ? 4 : 20,
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          backgroundColor: isUser ? '#0F172A' : '#EAF4F4',
        }}
      >
        <Text style={{ 
          color: isUser ? '#FFFFFF' : '#36585E', 
          fontFamily: 'Inter_400Regular', 
          fontSize: 15, 
          lineHeight: 22 
        }}>
          {item.text}
        </Text>
      </Animated.View>
    );
  };

  const renderFormContent = () => {
    const experiences = editableExperiences;
    
    if (experiences.length === 0) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Feather name="file-text" size={48} color="rgba(255,255,255,0.2)" />
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular', marginTop: 16, textAlign: 'center', fontSize: 16 }}>
            Your drafted journey will appear here once you share some details in the chat.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: '#FFFFFF', fontFamily: 'InstrumentSerif_400Regular', fontSize: 32, marginBottom: 8 }}>
          Review & Edit Draft
        </Text>
        
        {experiences.map((exp: any, index: number) => (
          <Animated.View 
            key={index}
            entering={FadeInDown.delay(index * 100).duration(400)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              gap: 16
            }}
          >
            <Text style={{ color: UI.accent, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>
              Experience {index + 1}
            </Text>

            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Title (Mandatory)</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, color: '#FFFFFF', fontFamily: 'Inter_400Regular', fontSize: 15 }}
                value={exp.title || ''}
                onChangeText={t => updateExperience(index, 'title', t)}
                placeholder="e.g. Software Engineer Intern"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 13 }}>Associated Goal (Optional)</Text>
                <TouchableOpacity onPress={() => setIsGoalModalVisible(true)}>
                  <Text style={{ color: UI.accent, fontFamily: 'Inter_500Medium', fontSize: 12 }}>+ Create Goal</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                {userGoals.map(goal => {
                  const isSelected = exp.goalIds?.includes(goal.id);
                  return (
                    <TouchableOpacity
                      key={goal.id}
                      onPress={() => {
                        const currentIds = exp.goalIds || [];
                        const newIds = isSelected ? currentIds.filter((id: string) => id !== goal.id) : [...currentIds, goal.id];
                        updateExperience(index, 'goalIds', newIds);
                      }}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16,
                        backgroundColor: isSelected ? UI.accent : 'rgba(255,255,255,0.05)',
                        borderWidth: 1, borderColor: isSelected ? UI.accent : 'rgba(255,255,255,0.1)',
                        marginRight: 8
                      }}
                    >
                      <Text style={{ color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter_500Medium' }}>
                        {goal.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Start Date</Text>
                <TextInput
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, color: '#FFFFFF', fontFamily: 'Inter_400Regular', fontSize: 15 }}
                  value={exp.startDate || ''}
                  onChangeText={t => updateExperience(index, 'startDate', t)}
                  placeholder="MMM YYYY"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>End Date</Text>
                <TextInput
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, color: '#FFFFFF', fontFamily: 'Inter_400Regular', fontSize: 15 }}
                  value={exp.endDate || ''}
                  onChangeText={t => updateExperience(index, 'endDate', t)}
                  placeholder="Present"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>
            </View>

            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Context / Description (Mandatory)</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, color: '#FFFFFF', fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 80 }}
                value={exp.context || ''}
                onChangeText={t => updateExperience(index, 'context', t)}
                placeholder="What did you do?"
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                textAlignVertical="top"
              />
            </View>
            
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Challenge Faced (Optional)</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, color: '#FFFFFF', fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 80 }}
                value={exp.challengeFaced || ''}
                onChangeText={t => updateExperience(index, 'challengeFaced', t)}
                placeholder="Any hurdles you overcame?"
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Outcome (Optional)</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, color: '#FFFFFF', fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 80 }}
                value={exp.outcome || ''}
                onChangeText={t => updateExperience(index, 'outcome', t)}
                placeholder="What was the result?"
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                textAlignVertical="top"
              />
            </View>

            {index > 0 && (
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>What led you to this experience? (Mandatory)</Text>
                <TextInput
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, color: '#FFFFFF', fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 60 }}
                  value={exp.decisionReason || ''}
                  onChangeText={t => updateExperience(index, 'decisionReason', t)}
                  placeholder="e.g. I wanted to apply my skills from the previous project..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            )}

            {exp.skills?.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {exp.skills.map((skill: any, i: number) => (
                  <View key={i} style={{ backgroundColor: 'rgba(255,105,0,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: UI.accent, fontSize: 12, fontFamily: 'Inter_500Medium' }}>{skill.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        ))}

        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 8,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>
            Back to Chat (Tell AI More)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: UI.accent,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 16,
            marginBottom: 40,
            opacity: isSubmitting ? 0.7 : 1
          }}
          onPress={handleFinalSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>
              Approve & Submit Journey
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ 
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
          paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
          borderBottomWidth: 1, borderColor: '#EAE7E0'
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
            <Feather name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: '#EAE7E0', 
            borderRadius: 20, 
            padding: 4 
          }}>
            <TouchableOpacity 
              onPress={() => setActiveTab('chat')}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingVertical: 8, paddingHorizontal: 16,
                borderRadius: 16,
                backgroundColor: activeTab === 'chat' ? '#FFFFFF' : 'transparent',
              }}
            >
              <Feather name="message-circle" size={16} color={activeTab === 'chat' ? '#0F172A' : '#4A5568'} />
              <Text style={{ color: activeTab === 'chat' ? '#0F172A' : '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 14 }}>
                Chat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('form')}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingVertical: 8, paddingHorizontal: 16,
                borderRadius: 16,
                backgroundColor: activeTab === 'form' ? '#FFFFFF' : 'transparent',
              }}
            >
              <Feather name="file-text" size={16} color={activeTab === 'form' ? '#0F172A' : '#4A5568'} />
              <Text style={{ color: activeTab === 'form' ? '#0F172A' : '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 14 }}>
                Form
              </Text>
              {journeyDraft?.experiences?.length > 0 && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: UI.accent, position: 'absolute', top: 6, right: 10 }} />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={{ width: 40 }} />
        </View>

        {isInitializing ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={UI.accent} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {activeTab === 'chat' ? (
              messages.length <= 1 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingBottom: 100 }}>
                  <Text style={{ 
                    color: '#0F172A', 
                    fontFamily: 'InstrumentSerif_400Regular', 
                    fontSize: 40, 
                    marginBottom: 16,
                    textAlign: 'center'
                  }}>
                    Share Your Journey
                  </Text>
                  <Text style={{ 
                    color: '#4A5568', 
                    fontFamily: 'Inter_400Regular', 
                    fontSize: 16, 
                    textAlign: 'center',
                    marginBottom: 40,
                    lineHeight: 24
                  }}>
                    {messages[0]?.text || "Tell me about your journey so far. You can mention your education, internships, projects, hackathons, startups, competitions, jobs, research, or any important experiences that helped shape your path."}
                  </Text>
                  
                  <View style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 24,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#EAE7E0',
                    minHeight: 140,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 2,
                  }}>
                    <TextInput
                      style={{
                        color: '#0F172A',
                        fontFamily: 'Inter_400Regular',
                        fontSize: 16,
                        textAlignVertical: 'top',
                        flex: 1
                      }}
                      placeholder="Describe your journey so far..."
                      placeholderTextColor="#94A3B8"
                      value={inputText}
                      onChangeText={setInputText}
                      multiline
                      editable={!isLoading}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12 }}>
                      <TouchableOpacity
                        style={{
                          width: 44, height: 44, borderRadius: 22,
                          backgroundColor: inputText.trim() ? '#D06757' : '#F1F5F9',
                          justifyContent: 'center', alignItems: 'center'
                        }}
                        onPress={sendMessage}
                        disabled={isLoading || !inputText.trim()}
                      >
                        <Feather name="arrow-up" size={20} color={inputText.trim() ? '#FFFFFF' : '#94A3B8'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <>
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                  />
                  
                  {isLoading && (
                    <Animated.View entering={FadeIn} style={{ padding: 16, alignSelf: 'flex-start' }}>
                      <ActivityIndicator color="rgba(255,255,255,0.5)" size="small" />
                    </Animated.View>
                  )}

                  <View style={{ 
                    flexDirection: 'row', alignItems: 'center', 
                    padding: 12, paddingHorizontal: 16, gap: 12,
                    backgroundColor: '#FAF9F6'
                  }}>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 24,
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        color: '#0F172A',
                        fontFamily: 'Inter_400Regular',
                        fontSize: 15,
                        maxHeight: 100,
                        borderWidth: 1,
                        borderColor: '#EAE7E0',
                      }}
                      placeholder="Describe your journey so far..."
                      placeholderTextColor="#94A3B8"
                      value={inputText}
                      onChangeText={setInputText}
                      multiline
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={{
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: inputText.trim() ? '#D06757' : '#F1F5F9',
                        justifyContent: 'center', alignItems: 'center'
                      }}
                      onPress={sendMessage}
                      disabled={isLoading || !inputText.trim()}
                    >
                      <Feather name="arrow-up" size={20} color={inputText.trim() ? '#FFFFFF' : '#94A3B8'} />
                    </TouchableOpacity>
                  </View>
                </>
              )
            ) : (
              renderFormContent()
            )}
          </View>
        )}

        <Modal
          visible={isGoalModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsGoalModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: UI.surfaceInverse, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'InstrumentSerif_400Regular', marginBottom: 16 }}>Create New Goal</Text>
              
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6, fontFamily: 'Inter_500Medium' }}>Goal Title</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 16 }}
                placeholder="e.g. Become a Senior Developer"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />
              
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6, fontFamily: 'Inter_500Medium' }}>Description (Optional)</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 24, minHeight: 80 }}
                placeholder="What exactly do you want to achieve?"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newGoalDesc}
                onChangeText={setNewGoalDesc}
                multiline
                textAlignVertical="top"
              />

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <TouchableOpacity onPress={() => setIsGoalModalVisible(false)} style={{ padding: 12 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_500Medium' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleCreateGoal}
                  disabled={isCreatingGoal || !newGoalTitle.trim()}
                  style={{ backgroundColor: UI.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, opacity: (!newGoalTitle.trim() || isCreatingGoal) ? 0.5 : 1 }}
                >
                  {isCreatingGoal ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ color: '#FFF', fontFamily: 'Inter_600SemiBold' }}>Save Goal</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
