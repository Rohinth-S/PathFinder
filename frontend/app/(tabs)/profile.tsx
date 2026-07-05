import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { updateProfile } from '../../api/auth.api';
import { L } from '../../constants/colors';

const MOCK_USER = {
  reputationScore: 72,
};

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
    <SafeAreaView style={{ flex: 1, backgroundColor: L.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={{ paddingTop: 56, paddingBottom: 40, alignItems: 'center', backgroundColor: L.background }}>
          {/* Avatar */}
          <View style={{
            width: 96, height: 96, borderRadius: 48,
            backgroundColor: L.tealTint,
            borderWidth: 2, borderColor: L.teal,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 38, fontWeight: '700', color: L.teal }}>
              {username[0].toUpperCase()}
            </Text>
          </View>

          <Text style={{ fontSize: 24, fontWeight: '700', color: L.navy, letterSpacing: -0.5, marginBottom: 10 }}>
            @{username}
          </Text>

          {/* Reputation pill */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: L.surface, borderWidth: 1, borderColor: L.border,
            paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
          }}>
            <Text style={{ fontSize: 12, color: L.navySoft, fontWeight: '500', marginRight: 6 }}>reputation</Text>
            <Text style={{ fontSize: 15, color: L.navy, fontWeight: '700' }}>{MOCK_USER.reputationScore}</Text>
          </View>
        </View>


        {/* ── Divider ── */}
        <View style={{ height: 1, backgroundColor: L.border, marginHorizontal: 24 }} />


        {/* ── Details Card ── */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
          <View style={{
            backgroundColor: L.surface, borderWidth: 1, borderColor: L.border,
            borderRadius: 16, padding: 24,
            shadowColor: '#152238', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 20,
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: L.navy }}>Details</Text>
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                style={{ backgroundColor: L.tealTint, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }}
              >
                <Text style={{ color: L.teal, fontWeight: '600', fontSize: 13 }}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Username */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: L.teal, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                Username
              </Text>
              {isEditing ? (
                <TextInput
                  style={{
                    borderWidth: 1, borderColor: L.border,
                    borderRadius: 12, padding: 14,
                    color: L.navy, fontWeight: '600', fontSize: 15,
                    backgroundColor: L.background,
                  }}
                  value={username}
                  onChangeText={setUsername}
                  placeholderTextColor={L.navySoft}
                />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '500', color: L.navy }}>{username}</Text>
              )}
            </View>

            {/* Language */}
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: L.teal, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
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
                          backgroundColor: sel ? L.teal : L.background,
                          borderColor: sel ? L.teal : L.border,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: sel ? '#FFFFFF' : L.navySoft }}>
                          {lang.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '500', color: L.navy }}>
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
                  backgroundColor: L.terracotta, paddingVertical: 14,
                  borderRadius: 28, alignItems: 'center', marginTop: 20,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>


        {/* ── Action Buttons ── */}
        <View style={{ paddingHorizontal: 24, gap: 12, marginBottom: 48 }}>
          <TouchableOpacity
            onPress={() => router.push('/share-journey')}
            style={{
              paddingVertical: 16, borderRadius: 28,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: L.teal,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Share / Update Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/full-journey')}
            style={{
              paddingVertical: 16, borderRadius: 28,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: L.border,
              backgroundColor: L.surface,
            }}
          >
            <Text style={{ color: L.navy, fontWeight: '500', fontSize: 15 }}>View Full Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            style={{ paddingVertical: 16, alignItems: 'center', marginTop: 8 }}
          >
            <Text style={{ color: L.navySoft, fontWeight: '500', fontSize: 13 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
