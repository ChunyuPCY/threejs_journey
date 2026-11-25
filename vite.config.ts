import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {
    ignorePatterns: ['.agents/**'],
    singleQuote: true,
    semi: false,
  },
  lint: {
    ignorePatterns: ['.agents/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  staged: {
    '*': 'vp check --fix',
  },
})
