import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

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
    backgroundColor: '#0F172A', // Keeping consistent dark theme
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#1E293B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
