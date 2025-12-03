/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        cardForeground: "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        primary: "hsl(var(--primary))",
        primaryForeground: "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        secondaryForeground: "hsl(var(--secondary-foreground))",
        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        destructiveForeground: "hsl(var(--destructive-foreground))",
        ring: "hsl(var(--ring))",
        wcGold: "#d4af37",
        wc: {
          deep: "#050509",
          gold: "#f5d580",
          goldStrong: "#ffd76a",
          glass: "rgba(255,255,255,0.05)",
        },
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px rgba(5, 5, 20, 0.55)",
        "gold-ring": "0 10px 40px rgba(212, 175, 55, 0.2)",
        "wc-glass": "0 0 40px rgba(0,0,0,0.45)",
        "wc-soft": "0 0 24px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "1.5rem",
        xl2: "1.25rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      fontSize: {
        // Increased base font sizes
        xs: ["0.875rem", { lineHeight: "1.5" }], // 14px (was 12px)
        sm: ["1rem", { lineHeight: "1.5" }], // 16px (was 14px)
        base: ["1.125rem", { lineHeight: "1.6" }], // 18px (was 16px)
        lg: ["1.25rem", { lineHeight: "1.6" }], // 20px (was 18px)
        xl: ["1.5rem", { lineHeight: "1.5" }], // 24px (was 20px)
        "2xl": ["1.875rem", { lineHeight: "1.4" }], // 30px (was 24px)
        "3xl": ["2.25rem", { lineHeight: "1.3" }], // 36px (was 30px)
        "4xl": ["3rem", { lineHeight: "1.2" }], // 48px (was 36px)
        "5xl": ["3.75rem", { lineHeight: "1.1" }], // 60px
      },
    },
  },
  plugins: [],
};
