import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Share, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { updateProfile } from '../../api/auth.api';

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
    <SafeAreaView className="flex-1 bg-brand-lightGray">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Header Background */}
        <View className="bg-brand-navy pt-16 pb-24 px-6 items-center">
          <Text className="text-brand-white text-xl font-bold tracking-widest uppercase opacity-90">My Profile</Text>
        </View>

        {/* Main Card (Overlapping header) */}
        <View className="px-6 -mt-16 mb-8">
          <View className="bg-brand-white rounded-3xl p-6 shadow-sm border border-brand-border items-center">
            
            {/* Avatar */}
            <View className="w-24 h-24 rounded-full bg-brand-teal items-center justify-center mb-4 border-4 border-brand-white shadow-sm -mt-16">
              <Text className="text-4xl font-extrabold text-brand-white">{username[0].toUpperCase()}</Text>
            </View>

            <Text className="text-2xl font-extrabold text-brand-navy mb-2">@{username}</Text>
            
            {/* Reputation Badge */}
            <View className="flex-row items-center bg-brand-cream px-4 py-2 rounded-full border border-brand-border mb-6">
              <Text className="text-base mr-2">⭐</Text>
              <Text className="text-sm text-brand-slate font-medium mr-2">Reputation</Text>
              <Text className="text-base font-extrabold text-brand-rust">{MOCK_USER.reputationScore}</Text>
            </View>

            {/* Edit / Details Section */}
            <View className="w-full bg-brand-lightGray rounded-2xl p-5 mb-2">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-lg font-bold text-brand-navy">Details</Text>
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)} className="bg-brand-white px-4 py-1.5 rounded-full border border-brand-border shadow-sm">
                  <Text className="text-brand-teal font-bold text-sm">{isEditing ? 'Cancel' : 'Edit'}</Text>
                </TouchableOpacity>
              </View>

              <View className="mb-5">
                <Text className="text-xs font-bold text-brand-slate uppercase tracking-wider mb-2">Username</Text>
                {isEditing ? (
                  <TextInput
                    className="bg-brand-white rounded-xl p-4 text-brand-navy font-bold border border-brand-teal shadow-sm"
                    value={username}
                    onChangeText={setUsername}
                  />
                ) : (
                  <Text className="text-base font-semibold text-brand-navy">{username}</Text>
                )}
              </View>

              <View className="mb-2">
                <Text className="text-xs font-bold text-brand-slate uppercase tracking-wider mb-3">Preferred Language</Text>
                {isEditing ? (
                  <View className="flex-row flex-wrap gap-2">
                    {languages.map((lang) => (
                      <TouchableOpacity
                        key={lang.code}
                        onPress={() => setLanguageCode(lang.code)}
                        className={`px-4 py-2 rounded-full border ${
                          languageCode === lang.code
                            ? 'bg-brand-teal border-brand-teal shadow-sm'
                            : 'bg-brand-white border-brand-border'
                        }`}
                      >
                        <Text
                          className={`text-sm font-bold ${
                            languageCode === lang.code ? 'text-brand-white' : 'text-brand-slate'
                          }`}
                        >
                          {lang.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text className="text-base font-semibold text-brand-navy">
                    {languages.find(l => l.code === languageCode)?.label || languageCode}
                  </Text>
                )}
              </View>

              {isEditing && (
                <TouchableOpacity 
                  className="bg-brand-navy py-4 rounded-xl items-center mt-6 shadow-sm" 
                  onPress={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-brand-white font-bold text-base">Save Changes</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 space-y-4 mb-12">
          <TouchableOpacity 
            className="bg-brand-teal py-4 rounded-2xl items-center flex-row justify-center shadow-sm"
            onPress={() => router.push('/share-journey')}
          >
            <Text className="text-xl">✍️</Text>
            <Text className="text-brand-white font-bold text-base ml-3">Share / Update Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-brand-white py-4 rounded-2xl items-center flex-row justify-center border border-brand-border shadow-sm"
            onPress={() => router.push('/full-journey')}
          >
            <Text className="text-xl">🗺️</Text>
            <Text className="text-brand-navy font-bold text-base ml-3">View Full Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="py-4 rounded-2xl items-center mt-4"
            onPress={handleSignOut}
          >
            <Text className="text-brand-slate font-bold text-sm">Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
