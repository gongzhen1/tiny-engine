export default {
  id: 'engine.config',
  theme: 'light',
  material: ['./mock/bundle.json'],
  scripts: [],
  styles: [],
  // 是否开启登录鉴权：开启后请求会走 withCredentials 携带 cookie，
  // HTTP 401 或业务认证错误码（CM004~CM339）时触发登录页跳转。
  enableLogin: true,
  // 外部登录跳转地址；留空则走内置登录表单（Login.vue）。
  // 由 designer-demo/env/.env.* 中的 VITE_LOGIN_URL 注入，
  // 这里放在 engine.config 是因为 workspace 包里的 import.meta.env.VITE_LOGIN_URL 取不到（define 白名单未包含）。
  loginUrl: import.meta.env.VITE_LOGIN_URL || '',
  // 是否开启 TailWindCSS 特性
  enableTailwindCSS: true,
  // 是否开启 使用结构化CSS 特性
  enableStructuredCss: false
}
