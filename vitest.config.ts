import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,        // 支持全局 describe/it/expect
    environment: 'node',  // 测试环境为 Node.js
    clearMocks: true,     // 每个测试前自动清除 mock
    setupFiles: [
      './vitest.setup.ts' // 让 Vitest 在运行测试前加载 tsconfig-paths/register
    ],       // 如有全局钩子可在此引入
    alias: {
      // 如果你在 tsconfig.json 中配置了路径别名，这里也要同步
      '@app': '/src/app.ts',
      '@domain': '/src/domain',
      '@application': '/src/application',
      '@infrastructure': '/src/infrastructure',
      "@interfaces": "/src/interfaces"
    },
    poolOptions: {
      threads: {            // 开启线程数限制，是因为并发跑 integration 测试时，必然会导致同时操作数据库，产生异常。
        maxThreads: 1,      // 限制最大线程数为 1
        minThreads: 1,      // 最小线程数为 1
      }
    }
  },
});
