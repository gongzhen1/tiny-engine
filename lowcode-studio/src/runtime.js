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
import { initRuntimeRenderer } from '@11kit/tiny-engine-runtime-renderer'
import './runtime/styles/global.less'

async function startApp() {
  try { 
    await initRuntimeRenderer()
  }
  catch (error) { 
    //eslint-disable-next-line no-console
    console.error('Failed to initialize runtime renderer:',error)
  }
}

startApp()
