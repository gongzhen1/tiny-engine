import path from 'node:path'
import { defineConfig, mergeConfig } from 'vite'
import { useTinyEngineBaseConfig } from '@opentiny/tiny-engine-vite-config'

export default defineConfig((configEnv) => {
  const baseConfig = useTinyEngineBaseConfig({
    viteConfigEnv: configEnv,
    root: __dirname,
    iconDirs: [path.resolve(__dirname, './node_modules/@opentiny/tiny-engine/assets/')],
    useSourceAlias: true,
    envDir: './env',
    registryPath: './registry.js'
  })
  console.log(baseConfig.server.proxy)
  baseConfig.server = baseConfig.server || {}
  baseConfig.server.proxy = {}
  const customConfig = {
    envDir: './env',
    publicDir: path.resolve(__dirname, './public'),
    server: {
      host: "0.0.0.0",
      port: 8090,
      proxy: {
        '/app-center/api/chat/completions': {
          target: 'http://192.168.80.130:5090',
          changeOrigin: true,
          rewrite: path => path.replace('/app-center/api/chat/completions', '/api/chat/completions')
        },
        '/app-center/api/ai/chat': {
          target: 'http://192.168.80.130:5090',
          changeOrigin: true,
          rewrite: path => path.replace('/app-center/api/ai/chat', '/api/chat/completions')
        },
        '/app-center/v1/api': {
          target: 'http://localhost:9090/', changeOrigin: true
        },
        '/app-center/api': {
          target: 'http://localhost:9090/', changeOrigin: true
        },
        '/material-center/api': {
          target: 'http://localhost:9090/', changeOrigin: true
        },
        '/platform-center/api': {
          target: 'http://localhost:9090/', changeOrigin: true
        }
      }
    }
  }

  return mergeConfig(baseConfig, customConfig)
})
