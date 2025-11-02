/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#d4b483",
          2: "#cbb4ff",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
