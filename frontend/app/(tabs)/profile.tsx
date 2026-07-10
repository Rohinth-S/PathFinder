import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, TextInput, Image, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { syncUser, updateProfile, SyncedUser } from '../../api/auth.api';
import { UI } from '../../constants/colors';
import { Feather } from '@expo/vector-icons';
import BottomSheet, { BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, FadeInDown, FadeInUp } from 'react-native-reanimated';
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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '70%'], []);

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
      
      setShowSuccessTick('language');
      languageScale.value = withSequence(withSpring(1.2, { damping: 10 }), withSpring(1));
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
      usernameScale.value = withSequence(withSpring(1.2, { damping: 10 }), withSpring(1));
      setTimeout(() => setShowSuccessTick(null), 2000);
    } catch (error) {
      console.warn("Failed to update username", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const usernameAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: usernameScale.value }] }));
  const languageAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: languageScale.value }] }));

  const displayName = username ? `@${username}` : clerkUser?.firstName || 'New User';
  const reputationScore = typeof user?.reputationScore === 'object'
    ? (user.reputationScore as any)?.low ?? 0
    : user?.reputationScore ?? 0;

  const filteredLanguages = LANGUAGES.filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: UI.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={UI.accent} />
          <Text style={{ marginTop: 12, color: UI.fg40, fontSize: 13, fontFamily: 'Inter_400Regular' }}>Loading profile...</Text>
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
      <Animated.View entering={FadeInDown.duration(400).springify()} style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 8 }}>
        <SectionLabel>Your Details</SectionLabel>
        <Text style={{
          fontFamily: 'InstrumentSerif_400Regular',
          fontSize: 48, color: UI.foreground, marginTop: 4, letterSpacing: -1
        }}>
          Profile
        </Text>
      </Animated.View>

      <DotDivider style={{ marginHorizontal: 24, marginBottom: 24 }} />

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        
        {/* Avatar Section */}
        <Animated.View entering={FadeInUp.delay(100).duration(400).springify()} style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{
            width: 104, height: 104, borderRadius: 52,
            backgroundColor: clerkUser?.hasImage ? UI.surface : UI.surfaceDim,
            borderWidth: 1, borderColor: UI.border,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, overflow: 'hidden'
          }}>
            {clerkUser?.hasImage ? (
              <Image source={{ uri: clerkUser.imageUrl }} style={{ width: 104, height: 104 }} />
            ) : (
              <Feather name="user" size={40} color={UI.fg40} />
            )}
          </View>
          <Text style={{ fontSize: 22, color: UI.foreground, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>
            {displayName}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <PillBadge label={`${reputationScore} REP`} color={UI.accent} bgColor={UI.accentSoft} />
            {reputationScore > 0 && (
              <PillBadge label="VERIFIED" color={UI.success} bgColor={UI.successTint} />
            )}
          </View>
        </Animated.View>

        {/* Editable Fields */}
        <Animated.View entering={FadeInUp.delay(200).duration(400).springify()} style={{ marginBottom: 40, gap: 16 }}>
          {/* Username Field */}
          <View style={{
            backgroundColor: UI.surface, borderRadius: 12, borderWidth: 1, borderColor: UI.border, padding: 20,
            shadowColor: UI.foreground, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1
          }}>
            <SectionLabel style={{ marginBottom: 12 }}>USERNAME</SectionLabel>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextInput
                style={{ fontSize: 16, color: UI.foreground, flex: 1, padding: 0, fontFamily: 'Inter_600SemiBold' }}
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
            backgroundColor: UI.surface, borderRadius: 12, borderWidth: 1, borderColor: UI.border, padding: 20,
            shadowColor: UI.foreground, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1
          }}>
            <SectionLabel style={{ marginBottom: 12 }}>LANGUAGE</SectionLabel>
            <TouchableOpacity 
              onPress={() => bottomSheetRef.current?.expand()}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 16, color: UI.foreground, flex: 1, fontFamily: 'Inter_600SemiBold' }}>
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
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInUp.delay(300).duration(400).springify()} style={{ gap: 12, marginBottom: 48 }}>
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
        </Animated.View>
      </ScrollView>

      {/* Bottom Sheet Picker (Language) */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: UI.surface }}
        handleIndicatorStyle={{ width: 40, height: 4, backgroundColor: UI.border }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
          <Text style={{ fontSize: 20, color: UI.foreground, marginBottom: 16, fontFamily: 'InstrumentSerif_400Regular' }}>Select Language</Text>
          
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: UI.background, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16,
            borderWidth: 1, borderColor: UI.border
          }}>
            <Feather name="search" size={18} color={UI.fg40} />
            <BottomSheetTextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15, color: UI.foreground, fontFamily: 'Inter_400Regular' }}
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
                    borderRadius: 8,
                    backgroundColor: isSelected ? UI.surfaceDim : 'transparent',
                    marginBottom: 4
                  }}
                >
                  <Text style={{ fontSize: 15, fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular', color: isSelected ? UI.foreground : UI.fg80 }}>
                    {lang.label}
                  </Text>
                  {isSelected && (
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: UI.foreground, alignItems: 'center', justifyContent: 'center' }}>
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
