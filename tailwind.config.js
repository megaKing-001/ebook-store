/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16213E",
        parchment: "#F6F1E7",
        parchmentDark: "#EEE6D6",
        brass: "#9C7A2E",
        brassLight: "#B8944B",
        burgundy: "#6B2737",
        charcoal: "#2A2621",
        stone: "#8B8377"
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      maxWidth: {
        prose: "68ch"
      }
    }
  },
  plugins: []
};
