/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}", // Also scan components
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };