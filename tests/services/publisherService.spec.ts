import { PublisherService } from "@application/services/publisherService";
import { prisma } from "@infrastructure/db";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

describe("PubliserService Unit Test", () => {
  const service = new PublisherService();
  let createdId: number;

  beforeAll(async () => {
    // 清空测试表
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // 断开数据库连接
    await prisma.$disconnect();
  });

  it("create(): should create publisher successfully", async () => {
    const publisher = await service.create({
      name: "TestPublisher",
    });
    createdId = publisher.pkid;
    expect(publisher).toMatchObject({
      name: "TestPublisher",
    });
  });

  it("findByPkid(): should find the publisher by id", async () => {
    const publisher = await service.findByPkid(createdId);
    expect(publisher).not.toBeNull();
    expect(publisher?.pkid).toBe(createdId);
  });

  it("update(): should update publisher's info successfully", async () => {
    const updated = await service.update(createdId, { name: "UpdatedPublisher" });
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("UpdatedPublisher");
  });

  it("list(): should list all of publisher", async () => {
    const list = await service.list();
    expect(Array.isArray(list)).toBe(true);
    expect(list.find((u) => u.pkid === createdId)).toBeDefined();
  });

  it("delete(): should delete publisher by id", async () => {
    const ok = await service.delete(createdId);
    expect(ok).toBe(true);
    const shouldBeNull = await service.findByPkid(createdId);
    expect(shouldBeNull).toBeNull();
  });
});
