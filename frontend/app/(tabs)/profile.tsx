import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, TextInput, Image, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { syncUser, updateProfile, SyncedUser } from '../../api/auth.api';
import { UI } from '../../constants/colors';
import { Feather } from '@expo/vector-icons';
import BottomSheet, { BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { SectionLabel, PillBadge } from '../../components/ui/SectionLabel';
import { DotDivider } from '../../components/ui/DotDivider';
import { GradientButton } from '../../components/ui/GradientButton';

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

  // Animations
  const usernameScale = useSharedValue(1);
  const languageScale = useSharedValue(1);

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
      
      // Success animation
      setShowSuccessTick('language');
      languageScale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1)
      );
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
      
      // Success animation
      setShowSuccessTick('username');
      usernameScale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1)
      );
      setTimeout(() => setShowSuccessTick(null), 2000);
    } catch (error) {
      console.warn("Failed to update username", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const usernameAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: usernameScale.value }],
  }));
  const languageAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: languageScale.value }],
  }));

  const displayUsername = username || 'Set Username';
  const reputationScore = typeof user?.reputationScore === 'object'
    ? (user.reputationScore as any)?.low ?? 0
    : user?.reputationScore ?? 0;

  const filteredLanguages = LANGUAGES.filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: UI.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={UI.accent} />
          <Text style={{ marginTop: 12, color: UI.fg40, fontSize: 13, fontFamily: 'Manrope_400Regular' }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: UI.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 15, color: UI.fg50, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
          <GradientButton label="Retry" onPress={loadUserProfile} size="sm" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: UI.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 8 }}>
        <SectionLabel>Your Details</SectionLabel>
        <Text style={{
          fontFamily: 'InstrumentSerif_400Regular',
          fontSize: 32, color: UI.foreground, marginTop: 4,
        }}>
          Profile
        </Text>
      </View>

      <DotDivider style={{ marginHorizontal: 24, marginBottom: 24 }} />

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        
        {/* Avatar Section */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 96, height: 96, borderRadius: 48,
            backgroundColor: clerkUser?.hasImage ? UI.surface : UI.accentSoft,
            borderWidth: clerkUser?.hasImage ? 2 : 0, 
            borderColor: UI.accent,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, overflow: 'hidden'
          }}>
            {clerkUser?.hasImage ? (
              <Image source={{ uri: clerkUser.imageUrl }} style={{ width: 96, height: 96 }} />
            ) : (
              <Feather name="user" size={40} color={UI.accent} />
            )}
          </View>
          <Text style={{ fontSize: 20, color: UI.foreground, fontFamily: 'Manrope_700Bold' }}>
            @{displayUsername}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
            <PillBadge label={`${reputationScore} REP`} color={UI.accent} bgColor={UI.accentSoft} />
            {reputationScore > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: UI.success }} />
                <SectionLabel color={UI.success}>VERIFIED</SectionLabel>
              </View>
            )}
          </View>
        </View>

        {/* Editable Fields */}
        <View style={{ marginBottom: 32, gap: 12 }}>
          {/* Username Field */}
          <View style={{
            backgroundColor: UI.surface, borderRadius: 16, borderWidth: 1, borderColor: UI.fg08, padding: 20,
          }}>
            <SectionLabel style={{ marginBottom: 12 }}>USERNAME</SectionLabel>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextInput
                style={{ fontSize: 16, color: UI.foreground, flex: 1, padding: 0, fontFamily: 'Manrope_600SemiBold' }}
                value={username}
                onChangeText={setUsername}
                onBlur={handleSaveUsername}
                onSubmitEditing={handleSaveUsername}
                returnKeyType="done"
                placeholder="Set Username"
                placeholderTextColor={UI.fg40}
              />
              <TouchableOpacity onPress={() => { Keyboard.dismiss(); handleSaveUsername(); }}>
                <Animated.View style={usernameAnimStyle}>
                  {showSuccessTick === 'username' ? (
                    <Feather name="check" size={20} color={UI.success} />
                  ) : (
                    <Feather name="edit-2" size={16} color={UI.fg40} />
                  )}
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Language Field */}
          <View style={{
            backgroundColor: UI.surface, borderRadius: 16, borderWidth: 1, borderColor: UI.fg08, padding: 20,
          }}>
            <SectionLabel style={{ marginBottom: 12 }}>LANGUAGE</SectionLabel>
            <TouchableOpacity 
              onPress={() => bottomSheetRef.current?.expand()}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 16, color: UI.foreground, flex: 1, fontFamily: 'Manrope_600SemiBold' }}>
                {LANGUAGES.find(l => l.code === languageCode)?.label || languageCode}
              </Text>
              <Animated.View style={languageAnimStyle}>
                {showSuccessTick === 'language' ? (
                  <Feather name="check" size={20} color={UI.success} />
                ) : (
                  <Feather name="chevron-down" size={20} color={UI.fg40} />
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 12, marginBottom: 48 }}>
          <GradientButton
            label="View Full Journey"
            onPress={() => router.push('/full-journey')}
            icon="map"
          />

          <GradientButton
            label="Add Experience"
            onPress={() => router.push('/share-journey')}
            variant="outlined"
            icon="plus"
          />

          <TouchableOpacity
            onPress={handleSignOut}
            style={{ paddingVertical: 16, alignItems: 'center', marginTop: 12 }}
          >
            <SectionLabel color={UI.accentEnd}>SIGN OUT</SectionLabel>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Bottom Sheet Picker (Language) */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: UI.background }}
        handleIndicatorStyle={{ width: 40, height: 4, backgroundColor: UI.fg20 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
          <Text style={{ fontSize: 18, color: UI.foreground, marginBottom: 16, fontFamily: 'Manrope_700Bold' }}>Select Language</Text>
          
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: UI.surface, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16,
            borderWidth: 1, borderColor: UI.fg08
          }}>
            <Feather name="search" size={18} color={UI.fg40} />
            <BottomSheetTextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15, color: UI.foreground, fontFamily: 'Manrope_400Regular' }}
              placeholder="Search languages..."
              placeholderTextColor={UI.fg40}
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
                    backgroundColor: isSelected ? UI.accentSoft : 'transparent',
                    marginBottom: 4
                  }}
                >
                  <Text style={{ fontSize: 15, fontFamily: isSelected ? 'Manrope_600SemiBold' : 'Manrope_400Regular', color: isSelected ? UI.accent : UI.foreground }}>
                    {lang.label}
                  </Text>
                  {isSelected && (
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: UI.accent, alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="check" size={14} color="#FFFFFF" />
                    </View>
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
