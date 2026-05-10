import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'TinyEngineRuntimeRenderer',
      fileName: 'index'
    },
    rollupOptions: {
      // 禁用 treeshake，防止 Rollup 将 h() 创建的 VNode hoist 到模块级别，
      // 导致组件 ref 和生命周期失效
      treeshake: false,
      external: ['vue', '@vueuse/core', 'vue-i18n', /@opentiny\/tiny-engine.*/, /@opentiny\/vue.*/],
      output: {
        globals: {
          vue: 'Vue',
          '@opentiny/vue': 'TinyVue'
        }
      }
    }
  }
})
