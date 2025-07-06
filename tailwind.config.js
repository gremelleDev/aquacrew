//tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}", // Also scan components
    ],
    theme: {
      extend: {
        // our custom color palette
        colors: {
          'refresh-blue': '#00ADEF',
          'aqua-splash': '#7FDBFF',
          'coral-accent': '#FF6B6B',
          'energetic-lime': '#A4DE02',
          'soft-gray': '#F7F7F7',
          'charcoal-text': '#343A40',
        },
      },
    },
    plugins: [],
  };