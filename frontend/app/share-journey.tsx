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
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

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

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  const [proofUrlPrompt, setProofUrlPrompt] = useState<{ visible: boolean, expIndex: number }>({ visible: false, expIndex: -1 });
  const [tempProofUrl, setTempProofUrl] = useState('');

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
        setNewGoalTitle('');
        setNewGoalDesc('');
      }
    } catch (err) {
      Alert.alert("Error", "Could not create goal");
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const newExps = [...editableExperiences];
    newExps[index] = { ...newExps[index], [field]: value };
    setEditableExperiences(newExps);
  };

  const handleAddProofUrl = (index: number) => {
    setTempProofUrl('');
    setProofUrlPrompt({ visible: true, expIndex: index });
  };

  const submitProofUrl = () => {
    if (!tempProofUrl.trim()) return;
    const newExps = [...editableExperiences];
    const proofs = newExps[proofUrlPrompt.expIndex].proofs || [];
    proofs.push({ id: Date.now().toString(), sourceType: 'LINK', url: tempProofUrl.trim(), status: 'PENDING' });
    newExps[proofUrlPrompt.expIndex].proofs = proofs;
    setEditableExperiences(newExps);
    setProofUrlPrompt({ visible: false, expIndex: -1 });
  };

  const handleAddProofPhoto = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const base64Url = `data:${result.assets[0].mimeType || 'image/jpeg'};base64,${result.assets[0].base64}`;
      const newExps = [...editableExperiences];
      const proofs = newExps[index].proofs || [];
      proofs.push({ id: Date.now().toString(), sourceType: 'DOCUMENT', url: base64Url, status: 'PENDING' });
      newExps[index].proofs = proofs;
      setEditableExperiences(newExps);
    }
  };

  const handleAddProofDocument = async (index: number) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const fileUri = result.assets[0].uri;
      try {
        const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
        const mimeType = result.assets[0].mimeType || 'application/octet-stream';
        const base64Url = `data:${mimeType};base64,${base64}`;
        const newExps = [...editableExperiences];
        const proofs = newExps[index].proofs || [];
        proofs.push({ id: Date.now().toString(), sourceType: 'DOCUMENT', url: base64Url, status: 'PENDING' });
        newExps[index].proofs = proofs;
        setEditableExperiences(newExps);
      } catch (err) {
        Alert.alert("Error", "Failed to read document file");
      }
    }
  };

  const handleRemoveProof = (expIndex: number, proofIndex: number) => {
    const newExps = [...editableExperiences];
    newExps[expIndex].proofs.splice(proofIndex, 1);
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
        
        {/* Goal Form Section */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 8 }}>
          <Text style={{ color: UI.accent, fontFamily: 'Inter_600SemiBold', fontSize: 18, marginBottom: 16 }}>Your Goals</Text>
          
          {userGoals.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {userGoals.map(goal => (
                <View key={goal.id} style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_500Medium' }}>{goal.title}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6, fontFamily: 'Inter_500Medium' }}>Create a New Goal</Text>
          <TextInput
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12 }}
            placeholder="e.g. Become a Senior Developer"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
          />
          <TextInput
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12, minHeight: 60 }}
            placeholder="Description (Optional)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={newGoalDesc}
            onChangeText={setNewGoalDesc}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity 
            onPress={handleCreateGoal}
            disabled={isCreatingGoal || !newGoalTitle.trim()}
            style={{ backgroundColor: UI.accent, paddingVertical: 12, borderRadius: 12, alignItems: 'center', opacity: (!newGoalTitle.trim() || isCreatingGoal) ? 0.5 : 1 }}
          >
            {isCreatingGoal ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ color: '#FFF', fontFamily: 'Inter_600SemiBold' }}>Add Goal</Text>}
          </TouchableOpacity>
        </View>

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
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>What led you to this experience? (Optional)</Text>
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

            {/* Proofs Section */}
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Proofs (Optional)</Text>
              
              {exp.proofs && exp.proofs.length > 0 && (
                <View style={{ gap: 8, marginBottom: 12 }}>
                  {exp.proofs.map((proof: any, pIdx: number) => (
                    <View key={pIdx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10 }}>
                      <Feather name={proof.sourceType === 'LINK' ? 'link' : 'file'} size={16} color={UI.accent} style={{ marginRight: 8 }} />
                      <Text style={{ color: '#FFFFFF', flex: 1 }} numberOfLines={1}>
                        {proof.sourceType === 'LINK' ? proof.url : 'Uploaded File'}
                      </Text>
                      <TouchableOpacity onPress={() => handleRemoveProof(index, pIdx)}>
                        <Feather name="trash-2" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity 
                onPress={() => {
                  Alert.alert("Add Proof", "Choose proof type", [
                    { text: "URL Link", onPress: () => handleAddProofUrl(index) },
                    { text: "Upload Photo", onPress: () => handleAddProofPhoto(index) },
                    { text: "Upload Document", onPress: () => handleAddProofDocument(index) },
                    { text: "Cancel", style: "cancel" }
                  ]);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' }}
              >
                <Feather name="plus" size={16} color={UI.accent} style={{ marginRight: 6 }} />
                <Text style={{ color: UI.accent, fontFamily: 'Inter_500Medium' }}>Add Proof</Text>
              </TouchableOpacity>
            </View>
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
      </KeyboardAvoidingView>

      {/* Proof URL Modal */}
      <Modal visible={proofUrlPrompt.visible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#2D3748', width: '100%', borderRadius: 16, padding: 20 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_600SemiBold', marginBottom: 12 }}>Enter Proof URL</Text>
            <TextInput
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: 8, padding: 12, marginBottom: 16 }}
              placeholder="https://..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={tempProofUrl}
              onChangeText={setTempProofUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setProofUrlPrompt({ visible: false, expIndex: -1 })} style={{ padding: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitProofUrl} style={{ backgroundColor: UI.accent, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 }}>
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
