/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── New UI Design System (runanywhere.ai-inspired) ──
        ui: {
          bg: '#FAF9F6',
          surface: '#FFFFFF',
          'surface-dim': '#F4F3F1',
          'surface-inverse': '#0F172A',
          foreground: '#0F172A',
          accent: '#FF6900',
          'accent-end': '#FB2C36',
          success: '#1B9E77',
          teal: '#3E6B66',
          'teal-tint': '#E7EFEE',
          border: '#EAE7E0',
        },
        // ── Landing page design system (DESIGN.md) ──
        background: '#FAF9F6',
        surface: '#FFFFFF',
        navy: '#152238',
        'navy-soft': '#152238CC',
        teal: '#3E6B66',
        'teal-tint': '#E7EFEE',
        terracotta: '#C1603F',
        'terracotta-tint': '#F5E4DD',
        sand: '#D9C9A8',
        border: '#EAE7E0',
        // ── Legacy brand colors (used by journey/timeline views) ──
        brand: {
          navy: '#1A202C',
          teal: '#36585E',
          rust: '#D06757',
          tan: '#CBB79F',
          slate: '#587187',
          cream: '#FBFBF9',
          white: '#FFFFFF',
          lightGray: '#F1F5F9',
          border: '#E2E8F0',
          dark: '#0F172A',
          darkCard: '#1E293B',
          darkBorder: '#334155',
          indigo: '#6366F1',
          mutedText: '#94A3B8',
          tealBright: '#14B8A6',
          indigoLight: '#818CF8',
        },
      },
      fontFamily: {
        manrope: ['Manrope'],
        serif: ['InstrumentSerif_400Regular', 'serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
};
