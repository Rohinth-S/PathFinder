import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, SafeAreaView, ScrollView, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { startJourneySession, sendJourneyMessage, submitJourney, submitJourneyGoal, getUserJourney } from '../api/journey.api';
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

  const displayAlert = (title: string, message: string, onPress?: () => void) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
      if (onPress) onPress();
    } else {
      if (onPress) {
        Alert.alert(title, message, [{ text: "OK", onPress }]);
      } else {
        Alert.alert(title, message);
      }
    }
  };

  const displayConfirm = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
    } else {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", style: "destructive", onPress: onConfirm }
      ]);
    }
  };


  
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
      if (res.success && res.goal) {
        setUserGoals(prev => [...prev, { id: res.goal.id, title: res.goal.title }]);
        setNewGoalTitle('');
        setNewGoalDesc('');
      }
    } catch (err: any) {
      displayAlert("Error", err.message || "Could not create goal");
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
    const url = tempProofUrl.trim();
    const isGithub = url.toLowerCase().includes('github.com');
    const sourceType = isGithub ? 'github' : 'link';
    proofs.push({ id: Date.now().toString(), sourceType, url, status: 'PENDING' });
    newExps[proofUrlPrompt.expIndex].proofs = proofs;
    setEditableExperiences(newExps);
    setProofUrlPrompt({ visible: false, expIndex: -1 });
  };

  const handleAddProofPhoto = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: false,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newExps = [...editableExperiences];
      const proofs = newExps[index].proofs || [];
      const proofId = Date.now().toString();
      proofs.push({
        id: proofId,
        sourceType: 'image',
        localUri: asset.uri,
        mimeType: asset.mimeType || 'image/jpeg',
        filename: asset.fileName || 'photo.jpg',
        status: 'PENDING'
      });
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
      const asset = result.assets[0];
      const newExps = [...editableExperiences];
      const proofs = newExps[index].proofs || [];
      const proofId = Date.now().toString();
      proofs.push({
        id: proofId,
        sourceType: 'pdf',
        localUri: asset.uri,
        mimeType: asset.mimeType || 'application/pdf',
        filename: asset.name || 'document.pdf',
        status: 'PENDING'
      });
      newExps[index].proofs = proofs;
      setEditableExperiences(newExps);
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
        
        try {
          const journeyData = await getUserJourney(token);
          if (journeyData && journeyData.goals) {
            setUserGoals(journeyData.goals);
          }
        } catch (e) {
          console.warn('Failed to load existing goals:', e);
        }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      displayAlert("Error", "Could not process your message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!conversationId || editableExperiences.length === 0) {
      displayAlert("Incomplete", "Please share your experiences in the chat first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      
      const payload = { ...journeyDraft, experiences: editableExperiences };
      
      // Extract files to upload
      const filesToUpload: { id: string, uri: string, name: string, type: string }[] = [];
      const cleanedExperiences = editableExperiences.map(exp => {
        const { tempGoalInput, ...cleanedExp } = exp;
        if (cleanedExp.proofs) {
          cleanedExp.proofs = cleanedExp.proofs.map((p: any) => {
            if (p.localUri) {
              filesToUpload.push({
                id: p.id,
                uri: p.localUri,
                name: p.filename || 'upload',
                type: p.mimeType || 'application/octet-stream'
              });
            }
            const { localUri, filename, mimeType, status, ...rest } = p;
            return rest;
          });
        }
        return cleanedExp;
      });
      
      payload.experiences = cleanedExperiences;

      const res = await submitJourney(token, conversationId, payload, filesToUpload.length > 0 ? filesToUpload : undefined);
      if (res.success) {
        displayAlert(
          "Journey Saved! 🚀",
          "Your experiences have been verified and added to your Life Graph.",
          () => router.replace('/(tabs)/journey')
        );
      } else {
        displayAlert("Submission Issue", "Could not save your journey.");
      }
    } catch (err: any) {
      console.warn("Failed to submit journey:", err);
      displayAlert("Error", err?.message || "Failed to submit. Check required fields.");
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
          <Feather name="file-text" size={48} color="#94A3B8" />
          <Text style={{ color: '#4A5568', fontFamily: 'Inter_400Regular', marginTop: 16, textAlign: 'center', fontSize: 16 }}>
            Your drafted journey will appear here once you share some details in the chat.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: '#0F172A', fontFamily: 'InstrumentSerif_400Regular', fontSize: 32, marginBottom: 8 }}>
          Review & Edit Draft
        </Text>
        
        {/* Goal Form Section */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#EAE7E0', marginBottom: 8 }}>
          <Text style={{ color: UI.accent, fontFamily: 'Inter_600SemiBold', fontSize: 18, marginBottom: 16 }}>Your Goals</Text>
          
          {userGoals.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {userGoals.map(goal => (
                <View key={goal.id} style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <Text style={{ color: '#0F172A', fontSize: 13, fontFamily: 'Inter_500Medium' }}>{goal.title}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={{ color: '#4A5568', fontSize: 13, marginBottom: 6, fontFamily: 'Inter_500Medium' }}>Create a New Goal</Text>
          <TextInput
            style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE7E0', color: '#0F172A', borderRadius: 12, padding: 12, marginBottom: 12, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) }}
            placeholder="e.g. Become a Senior Developer"
            placeholderTextColor="#94A3B8"
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
          />
          <TextInput
            style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE7E0', color: '#0F172A', borderRadius: 12, padding: 12, marginBottom: 12, minHeight: 60, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) }}
            placeholder="Description (Optional)"
            placeholderTextColor="#94A3B8"
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
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: '#EAE7E0',
              gap: 16
            }}
          >
            <Text style={{ color: UI.accent, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>
              Experience {index + 1}
            </Text>

            <View>
              <Text style={{ color: '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Title (Mandatory)</Text>
              <TextInput
                style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE7E0', borderRadius: 12, padding: 14, color: '#0F172A', fontFamily: 'Inter_400Regular', fontSize: 15, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) }}
                value={exp.title || ''}
                onChangeText={t => updateExperience(index, 'title', t)}
                placeholder="e.g. Software Engineer Intern"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 13 }}>Associated Goal (Optional)</Text>
              </View>
              
              {userGoals.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 10 }}>
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
                          backgroundColor: isSelected ? UI.accent : '#F1F5F9',
                          borderWidth: 1, borderColor: isSelected ? UI.accent : '#E2E8F0',
                          marginRight: 8
                        }}
                      >
                        <Text style={{ color: isSelected ? '#FFFFFF' : '#4A5568', fontSize: 13, fontFamily: 'Inter_500Medium' }}>
                          {goal.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={{ 
                    flex: 1, 
                    backgroundColor: '#FFFFFF', 
                    borderWidth: 1, 
                    borderColor: '#EAE7E0', 
                    borderRadius: 12, 
                    paddingHorizontal: 12, 
                    paddingVertical: 10, 
                    color: '#0F172A', 
                    fontFamily: 'Inter_400Regular', 
                    fontSize: 14, 
                    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) 
                  }}
                  placeholder="Type new goal to associate..."
                  placeholderTextColor="#94A3B8"
                  value={exp.tempGoalInput || ''}
                  onChangeText={t => updateExperience(index, 'tempGoalInput', t)}
                />
                <TouchableOpacity
                  onPress={async () => {
                    const goalTitle = exp.tempGoalInput?.trim();
                    if (!goalTitle) return;
                    try {
                      const token = await getToken();
                      if (!token) throw new Error("Not authenticated");
                      const res = await submitJourneyGoal(token, {
                        title: goalTitle,
                        status: "In Progress",
                        topics: [],
                        subtopics: [],
                      });
                      if (res.success && res.goal) {
                        setUserGoals(prev => [...prev, { id: res.goal.id, title: res.goal.title }]);
                        const currentIds = exp.goalIds || [];
                        updateExperience(index, 'goalIds', [...currentIds, res.goal.id]);
                        updateExperience(index, 'tempGoalInput', '');
                      }
                    } catch (err: any) {
                      displayAlert("Error", err.message || "Could not create goal");
                    }
                  }}
                  style={{
                    backgroundColor: UI.accent,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Link</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Start Date</Text>
                <TextInput
                  style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE7E0', borderRadius: 12, padding: 14, color: '#0F172A', fontFamily: 'Inter_400Regular', fontSize: 15, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) }}
                  value={exp.startDate || ''}
                  onChangeText={t => updateExperience(index, 'startDate', t)}
                  placeholder="MM YYYY"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>End Date</Text>
                <TextInput
                  style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE7E0', borderRadius: 12, padding: 14, color: '#0F172A', fontFamily: 'Inter_400Regular', fontSize: 15, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) }}
                  value={exp.endDate || ''}
                  onChangeText={t => updateExperience(index, 'endDate', t)}
                  placeholder="Present"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View>
              <Text style={{ color: '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Context / Description (Mandatory)</Text>
              <TextInput
                style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE7E0', borderRadius: 12, padding: 14, color: '#0F172A', fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 80, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) }}
                value={exp.context || ''}
                onChangeText={t => updateExperience(index, 'context', t)}
                placeholder="What did you do?"
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
              />
            </View>
            
            <View>
              <Text style={{ color: '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Challenge Faced (Optional)</Text>
              <TextInput
                style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE7E0', borderRadius: 12, padding: 14, color: '#0F172A', fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 80, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) }}
                value={exp.challengeFaced || ''}
                onChangeText={t => updateExperience(index, 'challengeFaced', t)}
                placeholder="Any hurdles you overcame?"
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View>
              <Text style={{ color: '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Outcome (Optional)</Text>
              <TextInput
                style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE7E0', borderRadius: 12, padding: 14, color: '#0F172A', fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 80, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) }}
                value={exp.outcome || ''}
                onChangeText={t => updateExperience(index, 'outcome', t)}
                placeholder="What was the result?"
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
              />
            </View>

            {index > 0 && (
              <View>
                <Text style={{ color: '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>What led you to this experience? (Optional)</Text>
                <TextInput
                  style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE7E0', borderRadius: 12, padding: 14, color: '#0F172A', fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 60, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) }}
                  value={exp.decisionReason || ''}
                  onChangeText={t => updateExperience(index, 'decisionReason', t)}
                  placeholder="e.g. I wanted to apply my skills from the previous project..."
                  placeholderTextColor="#94A3B8"
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
              <Text style={{ color: '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6 }}>Proofs (Optional)</Text>
              
              {exp.proofs && exp.proofs.length > 0 && (
                <View style={{ gap: 8, marginBottom: 12 }}>
                  {exp.proofs.map((proof: any, pIdx: number) => (
                    <View key={pIdx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
                      <Feather name={(proof.sourceType === 'link' || proof.sourceType === 'github') ? 'link' : 'file'} size={16} color={UI.accent} style={{ marginRight: 8 }} />
                      <Text style={{ color: '#0F172A', flex: 1 }} numberOfLines={1}>
                        {(proof.sourceType === 'link' || proof.sourceType === 'github') ? proof.url : (proof.filename || 'Uploaded File')}
                      </Text>
                      <TouchableOpacity onPress={() => handleRemoveProof(index, pIdx)}>
                        <Feather name="trash-2" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <TouchableOpacity 
                  onPress={() => handleAddProofUrl(index)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
                >
                  <Feather name="link" size={16} color={UI.accent} style={{ marginRight: 6 }} />
                  <Text style={{ color: UI.accent, fontFamily: 'Inter_500Medium' }}>Add Link</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleAddProofPhoto(index)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
                >
                  <Feather name="image" size={16} color={UI.accent} style={{ marginRight: 6 }} />
                  <Text style={{ color: UI.accent, fontFamily: 'Inter_500Medium' }}>Add Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleAddProofDocument(index)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
                >
                  <Feather name="file-text" size={16} color={UI.accent} style={{ marginRight: 6 }} />
                  <Text style={{ color: UI.accent, fontFamily: 'Inter_500Medium' }}>Add Doc</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        ))}

        <TouchableOpacity
          style={{
            backgroundColor: '#FFFFFF',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 8,
            borderWidth: 1,
            borderColor: '#EAE7E0'
          }}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={{ color: '#0F172A', fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>
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
          <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }} style={{ width: 40, height: 40, justifyContent: 'center' }}>
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
                <ScrollView 
                  contentContainerStyle={{ 
                    flexGrow: 1, 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    padding: 24, 
                    paddingBottom: Platform.OS === 'web' ? 100 : 40 
                  }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={{ 
                    color: '#0F172A', 
                    fontFamily: 'InstrumentSerif_400Regular', 
                    fontSize: Platform.OS === 'web' ? 40 : 32, 
                    marginBottom: 16,
                    textAlign: 'center'
                  }}>
                    Share Your Journey
                  </Text>
                  <Text style={{ 
                    color: '#4A5568', 
                    fontFamily: 'Inter_400Regular', 
                    fontSize: Platform.OS === 'web' ? 16 : 14, 
                    textAlign: 'center',
                    marginBottom: Platform.OS === 'web' ? 40 : 24,
                    lineHeight: Platform.OS === 'web' ? 24 : 20
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
                        flex: 1,
                        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
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
                </ScrollView>
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
                        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
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
          <View style={{ backgroundColor: '#2D3748', width: '100%', maxWidth: 400, borderRadius: 16, padding: 20 }}>
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
