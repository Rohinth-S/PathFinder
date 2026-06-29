import { EmotionLabel, NodeType } from '../types/schema';

export const BRAND_COLORS = {
  navy: '#1A202C',
  teal: '#36585E',
  rust: '#D06757',
  tan: '#CBB79F',
  slate: '#587187',
  cream: '#FBFBF9',
  white: '#FFFFFF',
  lightGray: '#F1F5F9',
  border: '#E2E8F0'
};

export const EMOTION_COLORS: Record<string, { bg: string; text: string }> = {
  'Confident':        { bg: '#EAF4F4', text: '#36585E' }, // Teal tint
  'Uncertain':        { bg: '#FAF5EF', text: '#CBB79F' }, // Tan tint
  'Pivoting':         { bg: '#F3E9E8', text: '#587187' }, // Slate tint
  'Pushing through':  { bg: '#F9ECEB', text: '#D06757' }, // Rust tint
};

export const NODE_COLORS: Record<NodeType, { bg: string; iconBg: string; iconText: string }> = {
  Education:   { bg: '#FBFBF9', iconBg: '#EAF4F4', iconText: '#36585E' }, // Teal
  Job:         { bg: '#FBFBF9', iconBg: '#F3E9E8', iconText: '#587187' }, // Slate
  Decision:    { bg: '#FBFBF9', iconBg: '#FAF5EF', iconText: '#CBB79F' }, // Tan
  Failure:     { bg: '#FBFBF9', iconBg: '#F9ECEB', iconText: '#D06757' }, // Rust
  Startup:     { bg: '#FBFBF9', iconBg: '#EAF4F4', iconText: '#36585E' }, // Teal
  Achievement: { bg: '#FBFBF9', iconBg: '#E2E8F0', iconText: '#1A202C' }, // Navy
};

export const NODE_BORDER_COLORS: Record<NodeType, string> = {
  Education:   '#36585E',
  Job:         '#587187',
  Decision:    '#CBB79F',
  Failure:     '#D06757',
  Startup:     '#36585E',
  Achievement: '#1A202C',
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

