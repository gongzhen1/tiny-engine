import path from 'node:path'
import http from 'node:http'
import { defineConfig } from 'vite'
import { useTinyEngineBaseConfig } from '@opentiny/tiny-engine-vite-config'

// 自定义插件：为 /node_modules、/mock 请求自动添加 /studio 前缀
// dev（configureServer）和 preview（configurePreviewServer）都注册同一中间件，
// 保证 vite preview 静态服务器下 /mock/bundle.json 等请求也能命中 base 前缀。

// preview 模式下手动代理中间件：vite preview 不支持 proxy 字段，
// 用 Node 内置 http 模块转发，复用 dev 的 proxy 规则（target/changeOrigin/rewrite）。
// 规则按 Object.entries 顺序匹配（长前缀在前），命中即转发，不命中走 next() 交给静态服务器。
function createPreviewProxy(proxyConfig) {
  const rules = Object.entries(proxyConfig).map(([prefix, cfg]) => {
    const target = new URL(cfg.target)
    return {
      prefix,
      hostname: target.hostname,
      port: target.port || (target.protocol === 'https:' ? '443' : '80'),
      protocol: target.protocol,
      rewrite: cfg.rewrite
    }
  })
  return (req, res, next) => {
    for (const rule of rules) {
      if (!req.url.startsWith(rule.prefix)) continue
      let targetPath = req.url
      if (rule.rewrite) targetPath = rule.rewrite(req.url)
      const proxyReq = http.request(
        {
          hostname: rule.hostname,
          port: rule.port,
          path: targetPath,
          method: req.method,
          headers: { ...req.headers, host: `${rule.hostname}:${rule.port}` }
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers)
          proxyRes.pipe(res)
        }
      )
      proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'text/plain' })
        res.end(`preview proxy error: ${err.message}`)
      })
      req.pipe(proxyReq)
      return
    }
    next()
  }
}

function addBaseMiddlewarePlugin() {
  const rewriteMiddleware = (req, res, next) => {
    if (req.url && (req.url.startsWith('/node_modules') || req.url.startsWith('/mock'))) {
      req.url = '/studio' + req.url
    }
    next()
  }
  return {
    name: 'add-base-middleware',
    configureServer(server) {
      server.middlewares.use(rewriteMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteMiddleware)
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
      '/material/te': {
        target: 'http://192.168.80.1:4175',
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

  // 5.1 preview 启动端口（vite preview 命令）
  // 同时在 configurePreviewServer 注册 proxy 中间件，使 preview 模式也能访问后端 API
  // （vite preview 默认不支持 proxy 字段，需手动用 http 模块转发）
  baseConfig.preview = {
    ...(baseConfig.preview || {}),
    host: '0.0.0.0',
    port: 8099,
    open: 'http://192.168.80.1:8099/studio/',
    configurePreviewServer(server) {
      // proxy 中间件要放在静态文件处理之前，否则 /app-center/api 会被静态服务器先吃掉
      server.middlewares.use(createPreviewProxy(customServerConfig.proxy))
    }
  }

  // 6. 运行时渲染器入口配置
  // 6.1 将 @opentiny/tiny-engine-runtime-renderer 别名指向工作区源码（index.ts），
  //     dev/build 均直接使用源码，避免依赖该包的 dist 构建产物
  baseConfig.resolve = baseConfig.resolve || {}
  baseConfig.resolve.alias = {
    ...(baseConfig.resolve.alias || {}),
    '@opentiny/tiny-engine-runtime-renderer': path.resolve(__dirname, '../packages/runtime-renderer/index.ts')
  }

  // 6.2 将 runtime.html 纳入 build 入口（与 index.html / preview.html 行为一致）
  baseConfig.build = baseConfig.build || {}
  baseConfig.build.rollupOptions = baseConfig.build.rollupOptions || {}
  baseConfig.build.rollupOptions.input = {
    ...(baseConfig.build.rollupOptions.input || {}),
    runtime: path.resolve(__dirname, './runtime.html')
  }

  // 7. 直接返回配置，不使用 mergeConfig
  return baseConfig
})