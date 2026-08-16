/**
 * Copyright (c) 2023 - present TinyEngine Authors.
 * Copyright (c) 2023 - present Huawei Cloud Computing Technologies Co., Ltd.
 *
 * Use of this source code is governed by an MIT-style license.
 *
 * THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
 * BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
 * A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
 *
 */

import { createApp } from 'vue'
import { useAppSchema } from './src/composables/useAppSchema'
import { createAppRouter } from './src/router'
import { createPinia } from 'pinia'
import { createStores, generateStoresConfig } from './src/stores'
import App from './src/App.vue'
import i18n from '@opentiny/tiny-engine-i18n-host'

// 从 pathname 中解析 runtime 路径段。
// - 访问格式 A（原有）：/studio/runtime.html?id=xxx  -> 返回 { id: xxx }
// - 访问格式 B（新增）：/studio/runtime/<appName>(/...)   -> 返回 { appName: xxx }
//   其中 pathname 允许携带后续子路径（如 /studio/runtime/demo-app/foo），统一取第一段作为 appName。
const parseRuntimePathInfo = (): { id?: string; appName?: string } => {
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id') || undefined

  // 去掉 base 前缀，拿到相对路径（base=/studio/）
  const pathname = decodeURIComponent(location.pathname)
  // 可能是： /studio/runtime.html  /studio/runtime/<appName>  /studio/runtime/<appName>/foo
  const basePrefix = '/studio/'
  const relative = pathname.startsWith(basePrefix) ? pathname.slice(basePrefix.length) : pathname

  if (!relative || relative === 'runtime.html') {
    return { id }
  }

  // 只处理 runtime/<...> 形式的子路径
  const segments = relative.split('/').filter(Boolean)
  if (segments[0] === 'runtime' && segments.length >= 2) {
    const appName = segments[1]
    if (appName) {
      return { appName, id }
    }
  }

  return { id }
}

// 初始化运行时渲染器
export const initRuntimeRenderer = async () => {
  const { id: queryAppId, appName } = parseRuntimePathInfo()
  const { fetchAppSchema, fetchAppSchemaByName, fetchBlocks } = useAppSchema()

  if (queryAppId) {
    await fetchAppSchema(queryAppId)
  } else if (appName) {
    await fetchAppSchemaByName(appName)
  } else {
    throw new Error('Missing required "id" query parameter OR "appName" path segment')
  }

  await fetchBlocks()
  const router = await createAppRouter()

  const pinia = createPinia()
  const storesConfig = generateStoresConfig()
  const stores = createStores(storesConfig, pinia)

  const app = createApp(App)
  app.provide('stores', stores)

  // 全局错误处理（防止 scheduler 被打断）
  app.config.errorHandler = (err, instance, info) => {
    // eslint-disable-next-line no-console
    console.error('[GlobalErrorHandler]', err, info)
    if ((err as any)?.stack) {
      // eslint-disable-next-line no-console
      console.error('[GlobalErrorHandler stack]', (err as any).stack)
    }
  }

  app.use(pinia).use(router).use(i18n).mount('#app')

  return app
}
