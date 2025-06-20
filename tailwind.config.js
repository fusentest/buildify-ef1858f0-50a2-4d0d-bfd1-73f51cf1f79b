
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0088FF', // Classic Mega Man blue
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#00AA88', // X series green
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#CC0000', // Zero series red
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#FF9900', // ZX series orange
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}