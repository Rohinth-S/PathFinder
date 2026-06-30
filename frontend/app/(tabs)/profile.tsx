import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { updateProfile } from '../../api/auth.api';
import { BRAND_COLORS } from '../../constants/colors';

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

      const user = await updateProfile(token, {
        username,
        preferredLanguage: languageCode
      });
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
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND_COLORS.dark }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── Gradient-ish header ── */}
        <View style={{ 
          backgroundColor: BRAND_COLORS.darkCard, 
          paddingTop: 56, paddingBottom: 72, 
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: BRAND_COLORS.darkBorder,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: BRAND_COLORS.mutedText, letterSpacing: 3, textTransform: 'uppercase' }}>
            My Profile
          </Text>
        </View>

        {/* ── Main profile card (overlaps header) ── */}
        <View style={{ paddingHorizontal: 20, marginTop: -48, marginBottom: 24 }}>
          <View style={{ 
            backgroundColor: BRAND_COLORS.darkCard, 
            borderRadius: 24, 
            padding: 28,
            borderWidth: 1, 
            borderColor: BRAND_COLORS.darkBorder,
            alignItems: 'center',
          }}>
            {/* Avatar */}
            <View style={{ 
              width: 88, height: 88, borderRadius: 44, 
              backgroundColor: BRAND_COLORS.tealBright, 
              alignItems: 'center', justifyContent: 'center', 
              marginTop: -68,
              borderWidth: 4, borderColor: BRAND_COLORS.dark,
            }}>
              <Text style={{ fontSize: 36, fontWeight: '800', color: BRAND_COLORS.white }}>
                {username[0].toUpperCase()}
              </Text>
            </View>

            {/* Username */}
            <Text style={{ fontSize: 24, fontWeight: '800', color: BRAND_COLORS.white, marginTop: 16, marginBottom: 12 }}>
              @{username}
            </Text>

            {/* Reputation badge */}
            <View style={{ 
              flexDirection: 'row', alignItems: 'center', 
              backgroundColor: BRAND_COLORS.dark, 
              paddingHorizontal: 16, paddingVertical: 8, 
              borderRadius: 20, 
              borderWidth: 1, borderColor: BRAND_COLORS.darkBorder,
              marginBottom: 28,
            }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>⭐</Text>
              <Text style={{ fontSize: 13, color: BRAND_COLORS.mutedText, fontWeight: '600', marginRight: 6 }}>Reputation</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: BRAND_COLORS.tealBright }}>{MOCK_USER.reputationScore}</Text>
            </View>

            {/* ── Details section ── */}
            <View style={{ 
              width: '100%', 
              backgroundColor: BRAND_COLORS.dark, 
              borderRadius: 16, 
              padding: 20, 
              borderWidth: 1, borderColor: BRAND_COLORS.darkBorder,
            }}>
              {/* Header row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: BRAND_COLORS.white }}>Details</Text>
                <TouchableOpacity 
                  onPress={() => setIsEditing(!isEditing)} 
                  style={{ 
                    backgroundColor: BRAND_COLORS.darkCard, 
                    paddingHorizontal: 16, paddingVertical: 8, 
                    borderRadius: 20, 
                    borderWidth: 1, borderColor: BRAND_COLORS.darkBorder 
                  }}
                >
                  <Text style={{ color: BRAND_COLORS.tealBright, fontWeight: '700', fontSize: 13 }}>
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Username field */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: BRAND_COLORS.mutedText, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                  Username
                </Text>
                {isEditing ? (
                  <TextInput
                    style={{ 
                      backgroundColor: BRAND_COLORS.darkCard, 
                      borderRadius: 12, padding: 14, 
                      color: BRAND_COLORS.white, fontWeight: '600', fontSize: 15,
                      borderWidth: 1, borderColor: BRAND_COLORS.tealBright,
                    }}
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor={BRAND_COLORS.mutedText}
                  />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: BRAND_COLORS.white }}>{username}</Text>
                )}
              </View>

              {/* Language field */}
              <View style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: BRAND_COLORS.mutedText, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                  Preferred Language
                </Text>
                {isEditing ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {languages.map((lang) => {
                      const isSelected = languageCode === lang.code;
                      return (
                        <TouchableOpacity
                          key={lang.code}
                          onPress={() => setLanguageCode(lang.code)}
                          style={{ 
                            paddingHorizontal: 18, paddingVertical: 10, 
                            borderRadius: 20, 
                            borderWidth: 1,
                            backgroundColor: isSelected ? BRAND_COLORS.tealBright : BRAND_COLORS.darkCard,
                            borderColor: isSelected ? BRAND_COLORS.tealBright : BRAND_COLORS.darkBorder,
                          }}
                        >
                          <Text style={{ 
                            fontSize: 13, fontWeight: '700', 
                            color: isSelected ? BRAND_COLORS.white : BRAND_COLORS.mutedText 
                          }}>
                            {lang.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: BRAND_COLORS.white }}>
                    {languages.find(l => l.code === languageCode)?.label || languageCode}
                  </Text>
                )}
              </View>

              {/* Save button */}
              {isEditing && (
                <TouchableOpacity 
                  onPress={handleSave}
                  disabled={isSubmitting}
                  style={{ 
                    backgroundColor: BRAND_COLORS.tealBright, 
                    paddingVertical: 16, borderRadius: 14, 
                    alignItems: 'center', marginTop: 20,
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={BRAND_COLORS.white} />
                  ) : (
                    <Text style={{ color: BRAND_COLORS.white, fontWeight: '700', fontSize: 15 }}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* ── Action Buttons ── */}
        <View style={{ paddingHorizontal: 20, gap: 14, marginBottom: 40 }}>
          <TouchableOpacity 
            onPress={() => router.push('/share-journey')}
            style={{ 
              backgroundColor: BRAND_COLORS.darkCard, 
              paddingVertical: 18, borderRadius: 16, 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: BRAND_COLORS.tealBright,
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 10 }}>✍️</Text>
            <Text style={{ color: BRAND_COLORS.tealBright, fontWeight: '700', fontSize: 15 }}>Share / Update Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/full-journey')}
            style={{ 
              backgroundColor: BRAND_COLORS.darkCard, 
              paddingVertical: 18, borderRadius: 16, 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: BRAND_COLORS.darkBorder,
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 10 }}>🗺️</Text>
            <Text style={{ color: BRAND_COLORS.white, fontWeight: '700', fontSize: 15 }}>View Full Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSignOut}
            style={{ paddingVertical: 16, alignItems: 'center', marginTop: 8 }}
          >
            <Text style={{ color: BRAND_COLORS.mutedText, fontWeight: '600', fontSize: 14 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
