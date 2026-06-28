import { EmotionLabel, NodeType } from '../types/schema';

export const EMOTION_COLORS: Record<string, { bg: string; text: string }> = {
  'Confident':        { bg: '#D1FAE5', text: '#059669' },
  'Uncertain':        { bg: '#FEF3C7', text: '#D97706' },
  'Pivoting':         { bg: '#FFEDD5', text: '#C2410C' },
  'Pushing through':  { bg: '#FEE2E2', text: '#DC2626' },
};

export const NODE_COLORS: Record<NodeType, { bg: string; iconBg: string; iconText: string }> = {
  Education:   { bg: '#F1F5F9', iconBg: '#E2E8F0', iconText: '#64748B' },
  Job:         { bg: '#F5F3FF', iconBg: '#EDE9FE', iconText: '#8B5CF6' },
  Decision:    { bg: '#FEF3C7', iconBg: '#FEF3C7', iconText: '#D97706' },
  Failure:     { bg: '#FEE2E2', iconBg: '#FEE2E2', iconText: '#DC2626' },
  Startup:     { bg: '#EFF6FF', iconBg: '#DBEAFE', iconText: '#3B82F6' },
  Achievement: { bg: '#D1FAE5', iconBg: '#D1FAE5', iconText: '#10B981' },
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
  Failure:     '⚠️',
  Startup:     '🚀',
  Achievement: '⭐',
};

export function getEmotionStyle(label: EmotionLabel) {
  return EMOTION_COLORS[label] || { bg: '#F1F5F9', text: '#64748B' };
}

// Fallback categorization for product types
export const CATEGORY_COLORS = {
  blue: { iconBg: '#DBEAFE', iconText: '#3B82F6', icon: '🔧' },
  green: { iconBg: '#D1FAE5', iconText: '#10B981', icon: '👥' },
  purple: { iconBg: '#EDE9FE', iconText: '#8B5CF6', icon: '📈' },
  orange: { iconBg: '#FFEDD5', iconText: '#F97316', icon: '🏪' },
};

