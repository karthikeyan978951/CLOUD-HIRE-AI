/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0A192F",
          dark: "#0F172A",
          slate: "#1E293B",
          card: "rgba(30, 41, 59, 0.7)",
          teal: "#0D9488",
          neonCyan: "#06B6D4",
          violet: "#6366F1",
          indigo: "#4F46E5",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon': '0 0 15px rgba(6, 182, 212, 0.4)',
        'neon-violet': '0 0 15px rgba(99, 102, 241, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
