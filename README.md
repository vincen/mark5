# Technology Stack

- Fastify
- TypeScript
- Prisma ORM
- Vitest
- PostgreSQL

# Project Structure

mark5
├── .env
├── .gitignore
├── README.md
├── package-lock.json
├── package.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── application/
│   │   └── services/
│   │       └── userService.ts
│   ├── domain/
│   │   ├── models/
│   │   │   └── user.ts
│   │   └── repositories/
│   │       └── userRepository.ts
│   └── infrastructure/
│       └── db.ts
├── tests/
│   └── userService.spec.ts
├── tsconfig.json
└── vitest.config.ts


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

# init typescript config
npx tsc --init --rootDir src --outDir dist --esModuleInterop --resolveJsonModule --strict

# init Prisma
$ npx prisma init

# based on prisma/schema.prisma, generate db tables.
npx prisma migrate dev --name init

```



