import path from 'node:path'
import { defineConfig } from 'vite'
import { useTinyEngineBaseConfig } from '@opentiny/tiny-engine-vite-config'

// 自定义插件：为 /node_modules 请求自动添加 /studio 前缀
function addBaseMiddlewarePlugin() {
  return {
    name: 'add-base-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        console.log('📢 [Middleware] original URL:', req.url)
        if (req.url && req.url.startsWith('/node_modules')) {
          const newUrl = '/studio' + req.url
          console.log('✅ [Middleware] rewriting to:', newUrl)
          req.url = newUrl
        }
        if (req.url && req.url.startsWith('/mock')) {
          const newUrl = '/studio' + req.url
          console.log('✅ [Middleware] rewriting to:', newUrl)
          req.url = newUrl
        }
        next()
      })
    }
  }
}

export default defineConfig((configEnv) => {
  // 1. 获取基础配置
  const baseConfig = useTinyEngineBaseConfig({
    viteConfigEnv: configEnv,
    root: __dirname,
    iconDirs: [path.resolve(__dirname, './node_modules/@opentiny/tiny-engine/assets/')],
    useSourceAlias: false,
    envDir: './env',
    registryPath: './registry.js'
  })

  // 2. 设置 base 路径
  baseConfig.base = '/studio/'

  // 3. 确保 plugins 数组存在，并加入我们的自定义插件
  baseConfig.plugins = baseConfig.plugins || []
  baseConfig.plugins.push(addBaseMiddlewarePlugin())

  // 4. 合并 server 配置（手动合并，避免覆盖）
  const customServerConfig = {
    host: '0.0.0.0',
    port: 8098,
    open:"http://192.168.80.1:8098/studio/?type=app&id=920&tenant=1&pageid=1982",
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
      },
      '/admin': {
        target: 'http://192.168.80.130:5090',
        changeOrigin: true
      },
    }
  }

  // 合并 server 配置（保留 baseConfig 中原有的 server 属性，再用 customServerConfig 覆盖）
  baseConfig.server = {
    ...(baseConfig.server || {}),
    ...customServerConfig,
    // 确保 proxy 完全使用 customServerConfig 中的 proxy
    proxy: customServerConfig.proxy
  }

  // 5. 设置其他自定义字段
  baseConfig.envDir = './env'
  baseConfig.publicDir = path.resolve(__dirname, './public')

  // 6. 直接返回配置，不使用 mergeConfig
  return baseConfig
})