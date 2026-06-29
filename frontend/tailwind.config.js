/** @type {import('tailwindcss').Config} */
module.exports = {
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
          navy: '#1A202C',
          teal: '#36585E',
          rust: '#D06757',
          tan: '#CBB79F',
          slate: '#587187',
          cream: '#FBFBF9',
          white: '#FFFFFF',
          lightGray: '#F1F5F9',
          border: '#E2E8F0',
        },
      },
    },
  },
  plugins: [],
};
