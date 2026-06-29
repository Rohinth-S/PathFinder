import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TimelineEvent } from '../../types/schema';

const MY_TIMELINE: TimelineEvent[] = [
  {
    id: 'my-1', title: 'CS Undergraduate',
    startDate: '2020', endDate: '2024', organization: 'Anna University',
    isVerified: true, nodeType: 'Education', emotionLabel: 'Confident',
    timelineSummary: 'Studied Computer Science, built projects in React Native and ML.',
    expandedDetails: { context: 'Formal education.', challengeFaced: 'Balancing academics and side projects.', outcome: 'Built 5+ production apps.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['React Native', 'Python', 'ML'], transitions: [] },
  },
  {
    id: 'my-2', title: 'Hackathon Builder',
    startDate: '2024', endDate: 'Present', organization: 'Self',
    isVerified: false, nodeType: 'Startup', emotionLabel: 'Confident',
    timelineSummary: 'Participating in hackathons and building PathFinder.',
    expandedDetails: { context: 'Building real products.', challengeFaced: 'Time pressure and team coordination.', outcome: 'Shipped PathFinder MVP.', achievements: null, applicationStatus: null, emotionNote: null, goals: [], skills: ['Expo', 'TypeScript', 'Neo4j'], transitions: [] },
  },
];

export default function HistoryPage() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-brand-cream p-5">
      <Text className="text-xl font-bold text-brand-navy mb-4">My Life Graph</Text>
      {MY_TIMELINE.map((event, idx) => {
        const isLast = idx === MY_TIMELINE.length - 1;
        return (
          <TouchableOpacity
            key={event.id}
            className="flex-row mb-0 active:opacity-70"
            onPress={() => router.push({ pathname: '/journey-details', params: { eventData: JSON.stringify(event) } })}
          >
            <View className="w-6 items-center">
              <View className={`w-3.5 h-3.5 rounded-full mt-4 z-10 ${event.isVerified ? 'bg-brand-teal' : 'bg-brand-tan'}`} />
              {!isLast && <View className="w-1 flex-1 bg-brand-teal -mt-0.5" />}
            </View>
            <View className="flex-1 bg-brand-white rounded-xl p-3.5 ml-2.5 mb-3 border border-brand-border">
              <Text className="text-base font-bold text-brand-navy mb-0.5">{event.title}</Text>
              <Text className="text-xs text-brand-slate font-medium mb-1.5">{event.startDate} – {event.endDate}  •  {event.organization}</Text>
              <Text className="text-sm text-brand-slate leading-5" numberOfLines={2}>{event.timelineSummary}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
