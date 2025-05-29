# Technology Stack

- Fastify
- TypeScript
- Prisma ORM
- vitest
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
$ npm install fastify @prisma/client

# install dev dependencies
# tsconfig-paths：支持在 Vitest 中解析 tsconfig.json 里的路径别名
# @types/node：Node.js 内置类型
$ npm install -D typescript ts-node prisma vitest @types/node tsconfig-paths

# init typescript config
npx tsc --init --rootDir src --outDir dist --esModuleInterop --resolveJsonModule --strict

# init Prisma
$ npx prisma init

# based on prisma/schema.prisma, generate db tables.
npx prisma migrate dev --name init

```



