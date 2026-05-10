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
  baseConfig.server = baseConfig.server || {}
  baseConfig.server.proxy = {}
  const customConfig = {
    envDir: './env',
    publicDir: path.resolve(__dirname, './public'),
    server: {
      host: "0.0.0.0",
      port: 8098,
      historyApiFallback: {
        rewrites: [
          { from: /^\/runtime\/(.+)$/, to: '/runtime.html' }
        ]
      },
      proxy: {
        '/app-center/api/chat/completions': {
          target: 'http://192.168.80.130:5090',
          changeOrigin: true,
          rewrite: path => path.replace('/app-center/api/chat/completions', '/api/chat/completions')
        },
        '/app-center/api/ai/chat': {
          target: 'https://api.deepseek.com',
          changeOrigin: true,
          rewrite: path => path.replace('/app-center/api/ai/chat', '/chat/completions')
        },
        '/app-center/api': {
          target: 'http://192.168.80.130:5090',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app-center\/api/, '/api/appcenter')
        },
        '/app-center/v1/api': {
          target: 'http://192.168.80.130:5090',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app-center\/v1\/api/, '/api/appcenter')
        },
        '/platform-center/api': {
          target: 'http://192.168.80.130:5090',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/platform-center\/api/, '/api/appcenter')
        },
        '/material-center/api': {
          target: 'http://192.168.80.130:5090',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/material-center\/api/, '/api/materialcenter/api')
        },
        '/material/api': {
          target: 'http://192.168.80.130:5090',
          changeOrigin: true
        },
        '/api': {
          target: 'http://192.168.80.130:5090',
          changeOrigin: true
        }
      }
    },
    resolve: {
      alias: {
        '@opentiny/tiny-engine-plugin-robot': '@11kit/tiny-engine-plugin-robot',
      },
    },
  }

  return mergeConfig(baseConfig, customConfig)
})
