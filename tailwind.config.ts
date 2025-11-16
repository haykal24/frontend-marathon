import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#121212',
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#121212',
        },
        secondary: {
          DEFAULT: '#BEF200',
          50: '#f9fef0',
          100: '#f3fde0',
          200: '#e7fbc0',
          300: '#dbf9a0',
          400: '#cff680',
          500: '#bef200',
          600: '#9bc200',
          700: '#789200',
          800: '#566200',
          900: '#344200',
        },
        surface: '#F7F9F0',
        'gray-light': '#cccccc',
        'gray-medium': '#666666',
      },
      fontFamily: {
        sans: ['Fira Sans', 'system-ui', 'sans-serif'],
        display: ['Saira', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
