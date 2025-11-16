module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
    // Include .nuxt types untuk auto-imports
    extraFileExtensions: ['.vue'],
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:nuxt/recommended', // Nuxt plugin untuk handle auto-imports
  ],
  plugins: ['vue', '@typescript-eslint', 'nuxt'],
  rules: {
    // Disable rules that conflict with Nuxt auto-imports
    'no-undef': 'off', // Nuxt auto-imports tidak akan terdeteksi sebagai undefined
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        // Ignore composables yang digunakan di template
        ignoreRestSiblings: true,
      },
    ],
    // Disable TypeScript errors untuk auto-imports (akan di-handle oleh Nuxt)
    '@typescript-eslint/ban-ts-comment': 'off',
    // Allow @ts-ignore untuk auto-imports
    '@typescript-eslint/ban-ts-ignore': 'off',
    'vue/multi-word-component-names': 'off',
    // Disable template variable checking (handled by Vue compiler)
    'vue/no-undef-components': 'off',
    'vue/no-undef-in-template': 'off',
    // Nuxt specific rules
    'nuxt/no-cjs-in-config': 'off', // Allow CJS in config files
    // Allow console in development
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Allow debugger in development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
  // Ignore .nuxt folder (generated files)
  ignorePatterns: ['.nuxt/**', '.nuxt/**/*', 'dist/**', 'node_modules/**', '**/.nuxt/**'],
}
