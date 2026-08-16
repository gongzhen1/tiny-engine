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
import { initRuntimeRenderer } from '@opentiny/tiny-engine-runtime-renderer'

// 运行时渲染入口：需通过 ?id=<appId> 查询参数指定要渲染的应用
initRuntimeRenderer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[RuntimeRenderer] init failed:', err)
})
