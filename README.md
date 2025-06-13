# Technology Stack

- Fastify
- TypeScript
- Prisma ORM
- Vitest
- PostgreSQL

# Project Structure

```shell
mark5
├── .env
├── .git/
├── .gitignore
├── README.md
├── node_modules/
├── package-lock.json
├── package.json
├── docs
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.ts
│   ├── application/
│   │   └── services/
│   │       └── userService.ts
│   ├── domain/
│   │   └── models/
│   │       └── account/
│   │           ├── user.ts
│   │           └── userRepository.ts
│   ├── infrastructure/
│   │   └── db.ts
│   ├── interfaces/
│   │   └── controller/
│   │       └── userRoutes.ts
│   └── server.ts
├── tests/
│       ├── services/
│       │   └── userRoutes.spec.ts
│       └── interfaces/
│           └── userRoutes.spec.ts
├── tsconfig.json
└── vitest.config.ts
```

# Setup

```bash

$ mkdir mark5
$ cd mark5

$ npm init -y

# install core dependencies
# fastify-sensible: 提供常用 HTTP 错误、格式化工具
$ npm install fastify @prisma/client fastify-sensible

# install dev dependencies
# tsconfig-paths：支持在 Vitest 中解析 tsconfig.json 里的路径别名
# @types/node：Node.js 内置类型
# ts-node：在 Node.js 环境下直接运行 TypeScript 文件，省去手动编译 .ts → .js 的步骤，每次运行都会完整地加载并编译你的 TS 文件；不带文件监听。
# ts-node-dev：在 ts-node 基础上，加了热重载（watch & restart）功能。监听源文件变化，修改后自动重启进程。
#
$ npm install -D typescript ts-node prisma vitest @types/node tsconfig-paths ts-node-dev

# module-alias 能让 Node 在加载 JS 时，把诸如 require('@app') 或 import ... from '@domain/models/user' （编译后的 CommonJS） 映射到指定的目录或文件。
$ npm install -S module-alias

# init typescript config
npx tsc --init --rootDir src --outDir dist --esModuleInterop --resolveJsonModule --strict

# init Prisma
$ npx prisma init

# based on prisma/schema.prisma, generate db tables.
npx prisma migrate dev --name init

```


# Docker

- region: 华北6（乌兰察布）

```shell
# 构建镜像命令
$ docker build -t mark5_app:v4 .

# 运行容器
docker run -d \
  --name mark5_app \
  -p 3000:3000 \
  mark5_app:v4
```



这些提示的根本原因是：你的 `createApp` 函数是 `async` 的，所以它的返回类型是 `Promise<FastifyInstance>`，而你在测试里把它当成了 `FastifyInstance` 来用（直接调用 `app.ready()`、`app.inject()` 等），TypeScript 自然就会报错。

下面给出两种常见的解决方案，任选其一即可消除 VSCode 的类型提示错误，同时保持测试逻辑不变。

---

## 方案 A：在测试里把 `app` 明确声明为 “已经解包” 的 `FastifyInstance`

最简单的做法是，让 `app` 的类型变成 `FastifyInstance`（而不是 `Promise<FastifyInstance>`）。你可以直接使用内置的辅助类型 `Awaited<…>`（TS 4.5+），或者直接手动声明为 `FastifyInstance`。示例修改如下。

### 修改前（会报类型错误）

```ts
// tests/userRoutes.spec.ts
import { createApp } from '@app';
// ... 省略其他 import

let app: ReturnType<typeof createApp>;  // 这是 Promise<FastifyInstance>
let createdPkid: number;

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    app = await createApp();
    await app.ready();
    // ...
  });

  afterAll(async () => {
    await app.close();
    // ...
  });

  // ... 其它测试
});
```

上面 `ReturnType<typeof createApp>` 的确是 `Promise<FastifyInstance>`，所以 VSCode 会报 `app.ready is not a function` 等错误。

---

### 修改后（消除类型错误）

```ts
import { FastifyInstance } from 'fastify';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { prisma } from '@infrastructure/db';
import { Gender } from '@domain/models/user';
import { createApp } from '@app';

let app: FastifyInstance;    // 明确声明为 FastifyInstance，而不是 Promise<...>
let createdPkid: number;

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    app = await createApp();  // app 现在是一个 FastifyInstance
    await app.ready();
    await prisma.mark5_user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('POST /api/users 应创建用户并返回 201', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        name: 'APIUser',
        email: 'api@example.com',
        birthdate: '2000-01-01',
        gender: Gender.unknown,
        height: 170,
        status: true
      }
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('pkid');
    createdPkid = body.pkid;
  });

  it('GET /api/users/:pkid 返回用户', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/users/${createdPkid}`
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.pkid).toBe(createdPkid);
  });

  it('GET /api/users 列出用户', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/users' });
    expect(res.statusCode).toBe(200);
    const list = JSON.parse(res.payload);
    expect(Array.isArray(list)).toBe(true);
  });

  it('PUT /api/users/:pkid 更新用户', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/users/${createdPkid}`,
      payload: { height: 180 }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.height).toBe(180);
  });

  it('DELETE /api/users/:pkid 删除用户', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/users/${createdPkid}`
    });
    expect(res.statusCode).toBe(204);
  });
});
```

* **`let app: FastifyInstance;`**：这里直接把 `app` 的类型写成 `FastifyInstance`。
* 然后 `app = await createApp();`：`createApp()` 返回的 `Promise<FastifyInstance>` 被 `await` 解包后赋值给 `app`，此时 `app` 就是真正的 `FastifyInstance`，VSCode 不会再抱怨了 (`app.ready()`、`app.inject()`、`app.close()` 都是 `FastifyInstance` 自带的方法)。

如果你不想手动从 `fastify` 里多写一步 `import { FastifyInstance }`，也可以用 TypeScript 自带的工具类型 `Awaited<…>`，如下：

```ts
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { prisma } from '@infrastructure/db';
import { Gender } from '@domain/models/user';
import { createApp } from '@app';

let app: Awaited<ReturnType<typeof createApp>>;  // Resolve<Promise<FastifyInstance>> 即 FastifyInstance
let createdPkid: number;

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    app = await createApp();
    await app.ready();
    // ...
  });
  // ...
});
```

这行

```ts
let app: Awaited<ReturnType<typeof createApp>>;
```

等价于把 `app` 声明为 `FastifyInstance`。

---

## 方案 B：将 `createApp` 改为“同步返回”Fastify 实例

如果你更喜欢让 `createApp()` 直接返回一个 `FastifyInstance` 而不是 `Promise<…>`，可以把 `app.register(...)` 上的 `await` 去掉，改成：

```ts
// src/app.ts
import Fastify from 'fastify';
import sensible from 'fastify-sensible';
import { userRoutes } from '@interfaces/controller/userRoutes';

export function createApp() {
  const app = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        coerceTypes: 'array',
        useDefaults: true,
        removeAdditional: 'all'
      }
    }
  });

  app.register(sensible);
  app.register(userRoutes, { prefix: '/api' });
  return app;
}
```

这样 `createApp` 的类型是 `FastifyInstance` 而非 `Promise<FastifyInstance>`，在测试里你就可以直接写：

```ts
let app = createApp();      // app: FastifyInstance
await app.ready();          // 同样可以调用 ready()
```

但这样做的缺点是：

* `register(...)` 可能在内部是异步的（它返回一个 Promise），虽然多数场景下 `app.ready()` 会等待所有插件注册完成，但去掉 `await` 就让逻辑稍微更「隐式」。
* 只要你在测试里 `await app.ready()`，Fastify 会正确地等待所有注册完成，所以从测试效果上看是一样的。

如果你愿意采取方案 B，就把 `createApp` 改回普通函数（非 `async`），这样编辑器就不会再提示 `app` 是个 Promise。

---

## 总结

* 最直接的做法是 **在测试里把 `app` 声明成 `FastifyInstance`**，然后记得在 `beforeAll` 里加上 `app = await createApp()`。
* 如果想让 `createApp` 本身不返回 `Promise`，可以把它改成普通函数，去掉 `async` 和 `await`，直接返回 `FastifyInstance`。
* 任意方案，都请保持 import 路径正确（用相对路径或别名都行，但要保证别名配置无误），这样 VSCode 就不会再报 `app.inject is not a function`、`app.ready is not a function` 之类的红线错误。
