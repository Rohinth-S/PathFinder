import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { updateProfile } from '../../api/auth.api';

const C = {
  bg: '#050505',
  surface: '#0e0e0e',
  card: '#141414',
  white: '#FFFFFF',
  offWhite: '#e0e0e0',
  gray: '#888888',
  dimGray: '#555555',
  border: '#1e1e1e',
  gridLine: '#262626',
  accent: '#3a3a3a',
};

const MOCK_USER = {
  reputationScore: 72,
};

// Visible grid pattern
function GridBackground() {
  const lines = [];
  // Vertical lines
  for (let i = 0; i < 8; i++) {
    lines.push(
      <View key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i + 1) * 12.5}%`, width: 1, backgroundColor: C.gridLine }} />
    );
  }
  // Horizontal lines
  for (let i = 0; i < 16; i++) {
    lines.push(
      <View key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: i * 50, height: 1, backgroundColor: C.gridLine }} />
    );
  }
  return <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>{lines}</View>;
}


export default function ProfilePage() {
  const router = useRouter();
  const { signOut, getToken } = useAuth();
  
  const [username, setUsername] = useState('rohinth-s');
  const [languageCode, setLanguageCode] = useState('en');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages = [
    { label: 'English', code: 'en' },
    { label: 'Spanish', code: 'es' },
    { label: 'French', code: 'fr' },
    { label: 'Hindi', code: 'hi' },
  ];

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const user = await updateProfile(token, { username, preferredLanguage: languageCode });
      setUsername(user.username ?? username);
      setLanguageCode(user.preferredLanguage ?? languageCode);
      setIsEditing(false);
    } catch (error) {
      console.warn("Failed to update profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={{ paddingTop: 64, paddingBottom: 48, alignItems: 'center', overflow: 'hidden', backgroundColor: C.bg }}>
          <GridBackground />
          
          {/* Decorative ring */}
          <View style={{ position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: C.accent, opacity: 0.8 }} />

          {/* Avatar */}
          <View style={{
            width: 96, height: 96, borderRadius: 48,
            borderWidth: 1.5, borderColor: C.border,
            backgroundColor: C.surface,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
            zIndex: 1,
          }}>
            <Text style={{ fontSize: 38, fontWeight: '700', color: C.white }}>
              {username[0].toUpperCase()}
            </Text>
          </View>

          <Text style={{ fontSize: 26, fontWeight: '700', color: C.white, letterSpacing: -0.5, marginBottom: 12, zIndex: 1 }}>
            @{username}
          </Text>

          {/* Reputation pill */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1, borderColor: C.border,
            paddingHorizontal: 14, paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: C.surface,
            zIndex: 1,
          }}>
            <Text style={{ fontSize: 13, color: C.dimGray, fontWeight: '500', marginRight: 6 }}>reputation</Text>
            <Text style={{ fontSize: 15, color: C.white, fontWeight: '700' }}>{MOCK_USER.reputationScore}</Text>
          </View>
        </View>


        {/* ── Details Card ── */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 40, backgroundColor: C.surface }}>
          <View style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 1, backgroundColor: C.border }} />

          <View style={{
            borderWidth: 1, borderColor: C.border,
            borderRadius: 16, padding: 28,
            backgroundColor: C.card,
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: C.white }}>Details</Text>
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                style={{ borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: C.surface }}
              >
                <Text style={{ color: C.gray, fontWeight: '600', fontSize: 13 }}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Username */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: C.dimGray, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
                Username
              </Text>
              {isEditing ? (
                <TextInput
                  style={{
                    borderWidth: 1, borderColor: C.accent,
                    borderRadius: 10, padding: 14,
                    color: C.white, fontWeight: '600', fontSize: 15,
                    backgroundColor: C.surface,
                  }}
                  value={username}
                  onChangeText={setUsername}
                  placeholderTextColor={C.dimGray}
                />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '500', color: C.white }}>{username}</Text>
              )}
            </View>

            {/* Language */}
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: C.dimGray, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                Language
              </Text>
              {isEditing ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {languages.map((lang) => {
                    const sel = languageCode === lang.code;
                    return (
                      <TouchableOpacity
                        key={lang.code}
                        onPress={() => setLanguageCode(lang.code)}
                        style={{
                          paddingHorizontal: 18, paddingVertical: 10,
                          borderRadius: 20, borderWidth: 1,
                          backgroundColor: sel ? C.white : C.surface,
                          borderColor: sel ? C.white : C.border,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: sel ? C.bg : C.dimGray }}>
                          {lang.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '500', color: C.white }}>
                  {languages.find(l => l.code === languageCode)?.label || languageCode}
                </Text>
              )}
            </View>

            {/* Save */}
            {isEditing && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSubmitting}
                style={{
                  backgroundColor: C.white, paddingVertical: 14,
                  borderRadius: 10, alignItems: 'center', marginTop: 24,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={C.bg} />
                ) : (
                  <Text style={{ color: C.bg, fontWeight: '600', fontSize: 15 }}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>


        {/* ── Action Buttons ── */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 48, gap: 14, backgroundColor: C.bg, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 1, backgroundColor: C.border }} />

          {/* Decorative circle */}
          <View style={{ position: 'absolute', bottom: -40, left: -60, width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: C.accent, opacity: 0.8 }} />
          
          <TouchableOpacity
            onPress={() => router.push('/share-journey')}
            style={{
              paddingVertical: 16, borderRadius: 12,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: C.accent,
              backgroundColor: C.surface,
              zIndex: 1,
            }}
          >
            <Text style={{ color: C.white, fontWeight: '600', fontSize: 15 }}>Share / Update Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/full-journey')}
            style={{
              paddingVertical: 16, borderRadius: 12,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: C.border,
              backgroundColor: C.bg,
              zIndex: 1,
            }}
          >
            <Text style={{ color: C.dimGray, fontWeight: '500', fontSize: 15 }}>View Full Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            style={{ paddingVertical: 16, alignItems: 'center', marginTop: 8, zIndex: 1 }}
          >
            <Text style={{ color: C.dimGray, fontWeight: '500', fontSize: 13 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
