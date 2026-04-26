import { defineConfig } from 'astro/config'

export default defineConfig({
  output: 'static',
  vite: {
    css: {
      postcss: './postcss.config.js',
    },
  },
})
