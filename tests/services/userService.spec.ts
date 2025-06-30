import { UserServiceV2 } from "@application/services/userServiceV2";
import { Gender } from "@domain/models/account/user";
import { prisma } from "@infrastructure/db";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

describe("UserService Unit Test", () => {
  const service = new UserServiceV2();
  let createdId: number;

  beforeAll(async () => {
    // 清空测试表
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // 断开数据库连接
    await prisma.$disconnect();
  });

  it("create(): 应该成功创建用户", async () => {
    const user = await service.create({
      name: "TestUser",
      email: "test@example.com",
      birthdate: new Date("2001-01-01"),
      gender: Gender.unknown,
      height: 170,
      status: true,
    });
    createdId = user.pkid;
    expect(user).toMatchObject({
      name: "TestUser",
      email: "test@example.com",
      gender: Gender.unknown,
      height: 170,
      status: true,
    });
  });

  it("findByPkid(): 应该能根据 ID 查到用户", async () => {
    const user = await service.findByPkid(createdId);
    expect(user).not.toBeNull();
    expect(user?.pkid).toBe(createdId);
  });

  it("update(): 应该能更新用户信息", async () => {
    const updated = await service.update(createdId, { height: 180, status: false });
    expect(updated).not.toBeNull();
    expect(updated?.height).toBe(180);
    expect(updated?.status).toBe(false);
  });

  it("list(): 应该能列出用户列表", async () => {
    const list = await service.list();
    expect(Array.isArray(list)).toBe(true);
    expect(list.find((u) => u.pkid === createdId)).toBeDefined();
  });

  it("delete(): 应该能删除用户", async () => {
    const ok = await service.delete(createdId);
    expect(ok).toBe(true);
    const shouldBeNull = await service.findByPkid(createdId);
    expect(shouldBeNull).toBeNull();
  });
});
