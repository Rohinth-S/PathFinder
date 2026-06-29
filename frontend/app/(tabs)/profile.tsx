import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const MOCK_USER = {
  reputationScore: 72,
};

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuth();
  
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
    // Simulating save to backend
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my professional journey on PathFinder! https://pathfinder.app/u/${username}`,
      });
    } catch (error: any) {
      console.warn(error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <ScrollView className="flex-1 bg-brand-cream px-6 py-8">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-brand-navy items-center justify-center mb-3">
          <Text className="text-3xl font-extrabold text-brand-white">{username[0].toUpperCase()}</Text>
        </View>
        <Text className="text-2xl font-bold text-brand-navy mb-1">@{username}</Text>
        <View className="flex-row items-center space-x-1">
          <Text className="text-sm">⭐</Text>
          <Text className="text-sm text-brand-slate font-medium">Reputation Score: </Text>
          <Text className="text-base font-extrabold text-brand-rust">{MOCK_USER.reputationScore}</Text>
        </View>
      </View>

      <View className="bg-brand-white rounded-xl p-5 mb-6 border border-brand-border shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-brand-navy">Profile Details</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text className="text-brand-rust font-bold">{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-brand-slate mb-1">Username</Text>
          {isEditing ? (
            <TextInput
              className="bg-brand-lightGray rounded-lg p-3 text-brand-navy font-medium border border-brand-border"
              value={username}
              onChangeText={setUsername}
            />
          ) : (
            <Text className="text-base font-medium text-brand-navy">{username}</Text>
          )}
        </View>

        <View className="mb-2">
          <Text className="text-sm font-semibold text-brand-slate mb-2">Preferred Language</Text>
          {isEditing ? (
            <View className="flex-row flex-wrap gap-2">
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => setLanguageCode(lang.code)}
                  className={`px-3 py-1.5 rounded-full border ${
                    languageCode === lang.code
                      ? 'bg-brand-teal border-brand-teal'
                      : 'bg-brand-white border-brand-border'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      languageCode === lang.code ? 'text-brand-white' : 'text-brand-slate'
                    }`}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text className="text-base font-medium text-brand-navy">
              {languages.find(l => l.code === languageCode)?.label || languageCode}
            </Text>
          )}
        </View>
        
        {isEditing && (
          <TouchableOpacity 
            className="bg-brand-teal py-3 rounded-lg items-center mt-4" 
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-brand-white font-bold">Save Changes</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View className="space-y-3 mb-8">
        <TouchableOpacity 
          className="bg-brand-rust py-4 rounded-xl items-center flex-row justify-center space-x-2 shadow-sm"
          onPress={() => router.push('/share-journey')}
        >
          <Text className="text-base">✍️</Text>
          <Text className="text-brand-white font-bold text-base ml-2">Share / Update Journey</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-brand-white py-4 rounded-xl items-center flex-row justify-center space-x-2 border-2 border-brand-navy"
          onPress={() => router.push('/full-journey')}
        >
          <Text className="text-base">🗺️</Text>
          <Text className="text-brand-navy font-bold text-base ml-2">View Full Journey</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-brand-tan py-3 rounded-xl items-center mt-4"
          onPress={handleSignOut}
        >
          <Text className="text-brand-navy font-bold text-sm">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
