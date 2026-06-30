/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // Update the content paths to include all your components
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          // Core palette
          navy: '#1A202C',
          teal: '#36585E',
          rust: '#D06757',
          tan: '#CBB79F',
          slate: '#587187',
          cream: '#FBFBF9',
          white: '#FFFFFF',
          lightGray: '#F1F5F9',
          border: '#E2E8F0',
          // Dark theme
          dark: '#0F172A',
          darkCard: '#1E293B',
          darkBorder: '#334155',
          indigo: '#6366F1',
          mutedText: '#94A3B8',
          tealBright: '#14B8A6',
          indigoLight: '#818CF8',
        },
      },
    },
  },
  plugins: [],
};
