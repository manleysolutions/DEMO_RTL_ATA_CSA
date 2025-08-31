/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        uspsBlue: "#004B87",
        uspsRed: "#E71921",
        uspsGray: "#F3F4F6",
      },
    },
  },
  plugins: [],
};
