import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView,TextInput,Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { syncUser, updateProfile, SyncedUser } from '../../api/auth.api';
import { L } from '../../constants/colors';
import {Feather} from '@expo/vector-icons';
import BottomSheet, { BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';

const LANGUAGES = [
  { label: 'English', code: 'en' },
  { label: 'Hindi', code: 'hi' },
  { label: 'Bengali', code: 'bn' },
  { label: 'Telugu', code: 'te' },
  { label: 'Marathi', code: 'mr' },
  { label: 'Tamil', code: 'ta' },
  { label: 'Urdu', code: 'ur' },
  { label: 'Gujarati', code: 'gu' },
  { label: 'Kannada', code: 'kn' },
  { label: 'Odia', code: 'or' },
  { label: 'Malayalam', code: 'ml' },
  { label: 'Punjabi', code: 'pa' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { signOut, getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const [user, setUser] = useState<SyncedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [languageCode, setLanguageCode] = useState('en');
  const [showSuccessTick, setShowSuccessTick] = useState<'username' | 'language' | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bottom Sheet
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '70%'], []);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const syncedUser = await syncUser(token);
      setUser(syncedUser);
      setUsername(syncedUser.username ?? '');
      setLanguageCode(syncedUser.preferredLanguage ?? 'en');
    } catch (err: any) {
      console.warn("Failed to load profile:", err);
      setError(err?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLanguage = async (code: string) => {
    setLanguageCode(code);
    bottomSheetRef.current?.close();
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const updatedUser = await updateProfile(token, { username, preferredLanguage: code });
      setUser(updatedUser);
      setShowSuccessTick('language');
      setTimeout(() => setShowSuccessTick(null), 2000);
    } catch (error) {
      console.warn("Failed to update profile", error);
    }
  };

  const handleSaveUsername = async () => {
    if (username === user?.username) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const updatedUser = await updateProfile(token, { username, preferredLanguage: languageCode });
      setUser(updatedUser);
      setShowSuccessTick('username');
      setTimeout(() => setShowSuccessTick(null), 2000);
    } catch (error) {
      console.warn("Failed to update username", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const displayUsername = username || 'Set Username';
  const reputationScore = typeof user?.reputationScore === 'object'
    ? (user.reputationScore as any)?.low ?? 0
    : user?.reputationScore ?? 0;

  const filteredLanguages = LANGUAGES.filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: L.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={L.teal} />
          <Text style={{ marginTop: 12, color: L.navySoft, fontSize: 14 }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: L.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 15, color: L.navySoft, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity
            onPress={loadUserProfile}
            style={{ backgroundColor: L.teal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: L.background }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        
        {/* 2. Profile Header Block */}
        <View style={{ alignItems: 'center', marginBottom: 32, marginTop: 40 }}>
          <View style={{
            width: 96, height: 96, borderRadius: 48,
            backgroundColor: clerkUser?.hasImage ? L.surface : '#9CA3AF',
            borderWidth: 2, borderColor: L.teal,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, overflow: 'hidden'
          }}>
            {clerkUser?.hasImage ? (
              <Image source={{ uri: clerkUser.imageUrl }} style={{ width: 96, height: 96 }} />
            ) : (
              <Feather name="user" size={60} color="#475569" style={{ marginTop: 24 }} />
            )}
          </View>
          <Text style={{ fontSize: 17, fontWeight: '600', color: L.navy }}>
            @{displayUsername}
          </Text>
        </View>

        {/* 3. Editable Fields */}
        <View style={{backgroundColor: L.surface, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(62, 107, 102, 0.2)', padding: 24, marginBottom: 16,
        // Lift effect for iOS
        boxShadow: '0px 4px 10px rgba(21, 34, 56, 0.12)'}}>
          {/* Username Field */}
          <Text style={{ fontSize: 12, fontWeight: '400', color: L.teal, marginBottom: 8 }}>USERNAME</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4 }}>
            <TextInput
              style={{ fontSize: 16, fontWeight: '500', color: L.navy, flex: 1, padding: 0 }}
              value={username}
              onChangeText={setUsername}
              onBlur={handleSaveUsername}
              placeholder="Set Username"
              placeholderTextColor={L.navySoft}
            />
            {showSuccessTick === 'username' ? (
              <Feather name="check" size={18} color={L.teal} />
            ) : (
              <Feather name="edit-2" size={16} color={L.teal} />
            )}
          </View>
        </View>

          <View style={{backgroundColor: L.surface, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(62, 107, 102, 0.2)', padding: 24, marginBottom: 16,
          // Lift effect for iOS
          boxShadow: '0px 4px 10px rgba(21, 34, 56, 0.12)',
          // Lift effect for Android
          elevation: 4,}}>
          {/* Language Field */}
          <View>
            <Text style={{ fontSize: 12, fontWeight: '400', color: L.teal, marginBottom: 8 }}>LANGUAGE</Text>
            <TouchableOpacity 
              onPress={() => bottomSheetRef.current?.expand()}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4 }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: L.navy, flex: 1 }}>
                {LANGUAGES.find(l => l.code === languageCode)?.label || languageCode}
              </Text>
              {showSuccessTick === 'language' ? (
                <Feather name="check" size={18} color={L.teal} />
              ) : (
                <Feather name="edit-2" size={16} color={L.teal} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Primary Actions Block */}
        <View style={{ gap: 12, marginBottom: 48 }}>
          <TouchableOpacity
            onPress={() => router.push('/full-journey')}
            style={{
              paddingVertical: 16, borderRadius: 28,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: L.teal,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '400', fontSize: 16, letterSpacing:0.5 }}>View Full Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/share-journey')}
            style={{
              paddingVertical: 16, borderRadius: 28,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: L.surface,
              borderWidth: 1.5, borderColor: 'rgba(62, 107, 102, 0.3)'
            }}
          >
            <Text style={{ color: L.navy, fontWeight: '500', fontSize: 16, letterSpacing:0.5 }}>Add Experience</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            style={{ paddingVertical: 16, alignItems: 'center', marginTop: 8 }}
          >
            <Text style={{ color: L.terracotta, fontWeight: '500', fontSize: 12, letterSpacing: 0.5 }}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* 4. Bottom Sheet Picker (Language) */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: L.background }}
        handleIndicatorStyle={{ width: 40, height: 4, backgroundColor: 'rgba(62, 107, 102, 0.3)' }} // teal at 30%
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: L.navy, marginBottom: 16 }}>Select Language</Text>
          
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: L.surface, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16
          }}>
            <Feather name="search" size={18} color={L.teal} />
            <BottomSheetTextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15, color: L.navy }}
              placeholder="Search languages..."
              placeholderTextColor={L.navySoft}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            {filteredLanguages.map(lang => {
              const isSelected = lang.code === languageCode;
              return (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => handleSaveLanguage(lang.code)}
                  style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingVertical: 16, paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: isSelected ? L.tealTint : 'transparent',
                    marginBottom: 4
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: isSelected ? '600' : '400', color: isSelected ? L.teal : L.navy }}>
                    {lang.label}
                  </Text>
                  {isSelected && (
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: L.teal }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
