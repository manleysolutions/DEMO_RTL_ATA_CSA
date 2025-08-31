/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uspsBlue: "#333399",
        uspsRed: "#CC0000",
        uspsGray: "#f5f5f5",
      },
    },
  },
  plugins: [],
};
