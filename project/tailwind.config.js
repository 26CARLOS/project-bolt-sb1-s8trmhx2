/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A', // deep navy
        accent: '#DC2626', // red
        brandwhite: '#FFFFFF'
      }
    },
  },
  plugins: [],
};
