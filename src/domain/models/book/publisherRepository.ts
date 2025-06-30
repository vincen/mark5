import { prisma } from "@infrastructure/db";
import { Publisher } from "./book";

export class PublisherRepository {
  private toModel(row: any): Publisher {
    return {
      pkid: row.pkid,
      name: row.name,
    };
  }

  async create(data: Omit<Publisher, "pkid">): Promise<Publisher> {
    const created = await prisma.publisher.create({
      data: {
        name: data.name,
      },
    });
    return this.toModel(created);
  }

  async findByPkid(pkid: number): Promise<Publisher | null> {
    const found = await prisma.publisher.findUnique({ where: { pkid } });
    if (!found) return null;
    return this.toModel(found);
  }

  async findByName(name: string): Promise<Publisher | null> {
    const found = await prisma.publisher.findUnique({ where: { name } });
    if (!found) return null;
    return this.toModel(found);
  }

  async update(pkid: number, data: Partial<Omit<Publisher, "pkid">>): Promise<Publisher> {
    const updated = await prisma.publisher.update({
      where: { pkid },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
      },
    });
    return this.toModel(updated);
  }

  async delete(pkid: number): Promise<boolean> {
    try {
      await prisma.publisher.delete({ where: { pkid } });
      return true;
    } catch {
      return false;
    }
  }

  async list(): Promise<Publisher[]> {
    const all = await prisma.publisher.findMany();
    return all.map(this.toModel);
  }
}
