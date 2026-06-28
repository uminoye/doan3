/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#a63d40', soft: '#f6d9ca' },
        accent: { DEFAULT: '#1d6f5f', light: '#d4ede9' },
      },
    },
  },
  plugins: [],
};
