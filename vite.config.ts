import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const APP_VERSION_MODULE = {
  id: 'virtual:app-version',
  resolvedId: '\0virtual:app-version',
  fileName: 'version.json',
} as const

function appVersionPlugin(): Plugin {
  const buildInfo = { buildId: crypto.randomUUID(), builtAt: new Date().toISOString() }
  return {
    name: 'app-version',
    resolveId: (id) =>
      id === APP_VERSION_MODULE.id ? APP_VERSION_MODULE.resolvedId : null,
    load: (id) =>
      id === APP_VERSION_MODULE.resolvedId
        ? `export default ${JSON.stringify(buildInfo)}`
        : null,
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: APP_VERSION_MODULE.fileName,
        source: JSON.stringify(buildInfo),
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    appVersionPlugin(),
  ],
  base: './',
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
