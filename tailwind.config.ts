import type { Config } from 'tailwindcss'
import type { PluginUtils } from 'tailwindcss/types/config'
import typography from '@tailwindcss/typography'

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
      typography: ({ theme }: PluginUtils) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.primary.800'),
            lineHeight: '1.8',
            fontSize: '1rem',
            '*, ::before, ::after': {
              borderColor: theme('colors.secondary.200'),
  },
            p: {
              color: theme('colors.gray.600'),
              marginTop: '1em',
              marginBottom: '1em',
            },
            a: {
              color: theme('colors.secondary.DEFAULT'),
              fontWeight: '600',
              textDecoration: 'none',
              borderBottom: `1px solid ${theme('colors.secondary.DEFAULT')}`,
              transition: 'color 150ms ease, border-color 150ms ease',
              '&:hover': {
                color: theme('colors.primary.DEFAULT'),
                borderColor: theme('colors.primary.DEFAULT'),
              },
            },
            strong: {
              color: theme('colors.primary.DEFAULT'),
            },
            em: {
              color: theme('colors.primary.800'),
            },
            h1: {
              color: theme('colors.primary.DEFAULT'),
              fontFamily: theme('fontFamily.display').join(','),
              letterSpacing: '-0.04em',
            },
            h2: {
              color: theme('colors.primary.DEFAULT'),
              fontFamily: theme('fontFamily.display').join(','),
              letterSpacing: '-0.03em',
              fontWeight: '600',
              marginTop: '1.6em',
              marginBottom: '0.6em',
            },
            h3: {
              color: theme('colors.primary.DEFAULT'),
              fontFamily: theme('fontFamily.display').join(','),
              letterSpacing: '-0.02em',
              fontWeight: '600',
            },
            h4: {
              color: theme('colors.primary.DEFAULT'),
              fontFamily: theme('fontFamily.display').join(','),
              fontWeight: '600',
            },
            ul: {
              paddingLeft: '1.25rem',
              marginTop: '0.75em',
              marginBottom: '0.75em',
            },
            'ul > li::marker': {
              color: theme('colors.secondary.DEFAULT'),
            },
            ol: {
              paddingLeft: '1.25rem',
              marginTop: '0.75em',
              marginBottom: '0.75em',
            },
            'ol > li::marker': {
              color: theme('colors.secondary.DEFAULT'),
              fontWeight: '600',
            },
            blockquote: {
              paddingLeft: '1.25rem',
              borderLeft: `3px solid ${theme('colors.secondary.DEFAULT')}`,
              color: theme('colors.primary.DEFAULT'),
              fontStyle: 'normal',
              backgroundColor: theme('colors.surface'),
            },
            hr: {
              borderColor: theme('colors.secondary.200'),
              opacity: 0.6,
            },
            code: {
              color: theme('colors.primary.DEFAULT'),
              backgroundColor: theme('colors.surface'),
              padding: '0.2rem 0.45rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
            img: {
              borderRadius: '1rem',
            },
            table: {
              width: '100%',
              fontSize: '0.95rem',
            },
            thead: {
              color: theme('colors.primary.DEFAULT'),
              borderBottom: `1px solid ${theme('colors.secondary.300')}`,
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
}

export default config
