import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/
    },
    preview: {
      allowedHosts: ['super-intelligence-170923536461.europe-west1.run.app']
    }
  }
})
