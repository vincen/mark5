import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,        // 支持全局 describe/it/expect
    environment: 'node',  // 测试环境为 Node.js
    clearMocks: true,     // 每个测试前自动清除 mock
    setupFiles: [],       // 如有全局钩子可在此引入
    alias: {
      // 如果你在 tsconfig.json 中配置了路径别名，这里也要同步
      '@domain': '/src/domain',
      '@application': '/src/application',
      '@infrastructure': '/src/infrastructure',
    },
  },
});
