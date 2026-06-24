import { EmotionLabel, NodeType } from '../types/schema';

export const EMOTION_COLORS: Record<string, { bg: string; text: string }> = {
  'Confident':        { bg: '#D1FAE5', text: '#059669' },
  'Uncertain':        { bg: '#FEF3C7', text: '#92400E' },
  'Pivoting':         { bg: '#FFEDD5', text: '#C2410C' },
  'Pushing through':  { bg: '#FEE2E2', text: '#DC2626' },
};

export const NODE_BORDER_COLORS: Record<NodeType, string> = {
  Education:   '#94A3B8',
  Job:         '#8B5CF6',
  Decision:    '#F59E0B',
  Failure:     '#EF4444',
  Startup:     '#8B5CF6',
  Achievement: '#10B981',
};

export const NODE_ICONS: Record<NodeType, string> = {
  Education:   '🎓',
  Job:         '💼',
  Decision:    '◆',
  Failure:     '❌',
  Startup:     '🚀',
  Achievement: '⭐',
};

export function getEmotionStyle(label: EmotionLabel) {
  return EMOTION_COLORS[label] || { bg: '#F1F5F9', text: '#64748B' };
}
