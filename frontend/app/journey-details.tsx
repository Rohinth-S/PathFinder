import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TimelineEvent } from '@/types/schema';

const FALLBACK_EVENT: TimelineEvent = {
  id: 'fallback', title: 'Offered Custom Software Services',
  startDate: '1998', endDate: '2001', organization: 'AdventNet',
  isVerified: true, nodeType: 'Job', emotionLabel: 'Confident',
  timelineSummary: 'Solved business problems for small companies',
  expandedDetails: {
    context: 'Worked with small businesses to build custom software solutions.',
    challengeFaced: 'Projects were non-repeatable and hard to scale.',
    outcome: 'Realized the need for a simple, affordable CRM for small businesses.',
    achievements: 'Served 25+ small businesses\nBuilt strong domain understanding',
    applicationStatus: null, emotionNote: null,
    goals: [],
    skills: ['Customer Understanding', 'Problem Solving', 'Sales', 'Product Thinking'],
    transitions: [{ decisionLabel: 'Decided to build a product that solves their common problems at scale.', toExperienceId: 'sv-3' }],
  },
};

export default function JourneyDetailsPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventData?: string }>();

  let event: TimelineEvent = FALLBACK_EVENT;
  try {
    if (params.eventData) event = JSON.parse(params.eventData) as TimelineEvent;
  } catch { /* use fallback */ }

  const { expandedDetails } = event;
  const duration = `${event.startDate} – ${event.endDate}`;
  const yearSpan = (() => {
    const s = parseInt(event.startDate, 10);
    const e = event.endDate === 'Present' ? new Date().getFullYear() : parseInt(event.endDate, 10);
    if (isNaN(s) || isNaN(e)) return '';
    return `${e - s} years`;
  })();

  const achievementsList = expandedDetails.achievements
    ? expandedDetails.achievements.split('\n').filter(Boolean)
    : [];

  const tags = expandedDetails.skills.slice(0, 2).map(s =>
    s.length > 18 ? s.slice(0, 18) + '…' : s
  );

  return (
    <View style={s.wrapper}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {/* Header Bar */}
        <View style={s.headerBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Journey Details</Text>
          <Text style={s.moreIcon}>⋮</Text>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Text style={s.heroEmoji}>💼</Text>
          </View>
          <Text style={s.heroTitle}>{event.title}</Text>
          <Text style={s.heroMeta}>{duration}  •  {yearSpan}</Text>
          {tags.length > 0 && (
            <View style={s.tagRow}>
              {tags.map((t, i) => (
                <View key={i} style={s.tag}>
                  <Text style={s.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Detail Sections */}
        <View style={s.detailsCard}>
          {/* Context */}
          <DetailSection icon="💼" iconBg="#DBEAFE" title="Context" body={expandedDetails.context} />

          <View style={s.divider} />

          {/* Challenge */}
          <DetailSection icon="⚠️" iconBg="#FEF3C7" title="Challenge" body={expandedDetails.challengeFaced} />

          <View style={s.divider} />

          {/* Outcome / Learning */}
          <DetailSection icon="🎯" iconBg="#D1FAE5" title="Outcome / Learning" body={expandedDetails.outcome} />

          {/* Achievements */}
          {achievementsList.length > 0 && (
            <>
              <View style={s.divider} />
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <View style={[s.sectionIconWrap, { backgroundColor: '#EDE9FE' }]}>
                    <Text style={s.sectionEmoji}>🏆</Text>
                  </View>
                  <Text style={s.sectionTitle}>Key Achievements</Text>
                </View>
                {achievementsList.map((a, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bullet}>•</Text>
                    <Text style={s.bulletText}>{a}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={s.divider} />

          {/* Skills Built */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconWrap, { backgroundColor: '#DBEAFE' }]}>
                <Text style={s.sectionEmoji}>{'</>'}</Text>
              </View>
              <Text style={s.sectionTitle}>Skills Built</Text>
            </View>
            <View style={s.skillsRow}>
              {expandedDetails.skills.map((skill, i) => (
                <View key={i} style={s.skillPill}>
                  <Text style={s.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Decision That Led Next */}
          {expandedDetails.transitions.length > 0 && (
            <>
              <View style={s.divider} />
              <DetailSection
                icon="➡️"
                iconBg="#FEE2E2"
                title="Decision That Led Next"
                body={expandedDetails.transitions[0].decisionLabel}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={s.footer}>
        <TouchableOpacity style={s.footerBtn} onPress={() => router.back()}>
          <Text style={s.footerBtnText}>View Next Step  →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailSection({ icon, iconBg, title, body }: { icon: string; iconBg: string; title: string; body: string }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View style={[s.sectionIconWrap, { backgroundColor: iconBg }]}>
          <Text style={s.sectionEmoji}>{icon}</Text>
        </View>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <Text style={s.sectionBody}>{body}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },

  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backArrow: { fontSize: 22, color: '#1E293B' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  moreIcon: { fontSize: 22, color: '#64748B' },

  hero: { alignItems: 'center', marginBottom: 24 },
  heroIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroEmoji: { fontSize: 28 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 4 },
  heroMeta: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#C7D2FE' },
  tagText: { fontSize: 12, fontWeight: '600', color: '#4338CA' },

  detailsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  section: {},
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sectionEmoji: { fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  sectionBody: { fontSize: 15, color: '#475569', lineHeight: 22, paddingLeft: 42 },

  bulletRow: { flexDirection: 'row', paddingLeft: 42, marginTop: 4 },
  bullet: { color: '#6366F1', fontSize: 14, marginRight: 8, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 15, color: '#475569', lineHeight: 22 },

  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 42, marginTop: 4 },
  skillPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  skillText: { fontSize: 13, fontWeight: '500', color: '#334155' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  footerBtn: { backgroundColor: '#6366F1', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  footerBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
