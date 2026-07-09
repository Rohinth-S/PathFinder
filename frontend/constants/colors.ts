import { EmotionLabel, NodeType } from '../types/schema';

// ═══════════════════════════════════════════════════════
//  New UI Design System (runanywhere.ai-inspired)
//  Use `UI` for all new screens and revamped components.
// ═══════════════════════════════════════════════════════

export const UI = {
  // ── Backgrounds ──
  background:   '#FAF9F6',   // warm off-white canvas
  surface:      '#FFFFFF',   // card surfaces
  surfaceDim:   '#F4F3F1',   // slightly dimmed surface
  surfaceInverse: '#0F172A', // dark cards (navy-black)

  // ── Foreground (opacity-based system) ──
  foreground:   '#0F172A',   // primary text (near-black)
  fg80:         'rgba(15, 23, 42, 0.80)',  // strong secondary
  fg50:         'rgba(15, 23, 42, 0.50)',  // descriptions, placeholders
  fg40:         'rgba(15, 23, 42, 0.40)',  // labels, muted text
  fg20:         'rgba(15, 23, 42, 0.20)',  // dividers, subtle borders
  fg08:         'rgba(15, 23, 42, 0.08)',  // hairline dividers
  fg06:         'rgba(15, 23, 42, 0.06)',  // pill backgrounds

  // ── Accent (orange gradient) ──
  accent:       '#FF6900',   // primary CTA, gradient start
  accentEnd:    '#FB2C36',   // gradient end (red-orange)
  accentTint:   'rgba(255, 105, 0, 0.10)', // tinted backgrounds
  accentSoft:   'rgba(255, 105, 0, 0.06)', // very subtle tint

  // ── Success / Live ──
  success:      '#1B9E77',
  successTint:  'rgba(27, 158, 119, 0.10)',

  // ── Structural colors (evolved teal) ──
  teal:         '#3E6B66',
  tealTint:     '#E7EFEE',

  // ── Borders ──
  border:       '#EAE7E0',
  borderSubtle: 'rgba(15, 23, 42, 0.06)',

  // ── Dark card text ──
  onDark:       '#FFFFFF',
  onDark80:     'rgba(255, 255, 255, 0.85)',
  onDark50:     'rgba(255, 255, 255, 0.50)',
  onDark30:     'rgba(255, 255, 255, 0.30)',
  onDark10:     'rgba(255, 255, 255, 0.10)',
};

export const BRAND_COLORS = {
  // Core palette
  navy: '#1A202C',
  teal: '#36585E',
  rust: '#D06757',
  tan: '#CBB79F',
  slate: '#587187',
  cream: '#FBFBF9',
  white: '#FFFFFF',
  lightGray: '#F1F5F9',
  slateMuted: '#94A3B8',
  border: '#E2E8F0',
  // Dark theme
  dark: '#0F172A',
  darkCard: '#1E293B',
  darkBorder: '#334155',
  indigo: '#6366F1',
  mutedText: '#94A3B8',
  // Accent gradients (use in style props)
  tealBright: '#14B8A6',
  indigoLight: '#818CF8',
};

// Landing page design system (DESIGN.md) — kept for backward compat
export const L = {
  background:     '#FAF9F6',
  surface:        '#FFFFFF',
  navy:           '#152238',
  navySoft:       '#152238CC',
  teal:           '#3E6B66',
  tealTint:       '#E7EFEE',
  terracotta:     '#C1603F',
  terracottaTint: '#F5E4DD',
  sand:           '#D9C9A8',
  border:         '#EAE7E0',
  gray:           '#4A5568'
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

