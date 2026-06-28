import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BRAND_COLORS } from '../constants/colors';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [languageCode, setLanguageCode] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const languages = [
    { label: 'English', code: 'en' },
    { label: 'Spanish', code: 'es' },
    { label: 'French', code: 'fr' },
    { label: 'Hindi', code: 'hi' },
  ];

  const handleProfileSubmit = async () => {
    if (!username) return;
    setIsSubmitting(true);
    
    try {
      // @Rohita: Replace with actual backend endpoint to save user profile
      const response = await fetch(`${API_BASE}/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          preferredLanguage: languageCode,
        }),
      });
      
      // Even if fetch fails since it's a dummy endpoint, we'll log it and proceed for the demo
      console.log("Profile submission payload:", { username, preferredLanguage: languageCode });
      
      // Route to the dashboard page instead of the landing page
      router.replace('/dashboard');
    } catch (error) {
      console.warn("Error saving profile (dummy endpoint):", error);
      router.replace('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Tell us a bit about yourself to get started</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput 
          style={styles.input}
          placeholder="Enter your username"
          placeholderTextColor="#64748B"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Preferred Language</Text>
        <View style={styles.pillContainer}>
          {languages.map((lang) => (
            <TouchableOpacity 
              key={lang.code}
              style={[styles.pill, languageCode === lang.code && styles.pillActive]}
              onPress={() => setLanguageCode(lang.code)}
            >
              <Text style={[styles.pillText, languageCode === lang.code && styles.pillTextActive]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, (!username || isSubmitting) && styles.buttonDisabled]} 
        onPress={handleProfileSubmit}
        disabled={!username || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Save & Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: BRAND_COLORS.cream,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: BRAND_COLORS.navy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: BRAND_COLORS.slate,
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: BRAND_COLORS.navy,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: BRAND_COLORS.white,
    borderRadius: 12,
    padding: 16,
    color: BRAND_COLORS.navy,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: BRAND_COLORS.border,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    backgroundColor: BRAND_COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BRAND_COLORS.border,
  },
  pillActive: {
    backgroundColor: BRAND_COLORS.teal,
    borderColor: BRAND_COLORS.teal,
  },
  pillText: {
    color: BRAND_COLORS.slate,
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: BRAND_COLORS.white,
  },
  button: {
    backgroundColor: BRAND_COLORS.rust,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: BRAND_COLORS.rust,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: BRAND_COLORS.tan,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: BRAND_COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
