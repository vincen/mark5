import { prisma } from "@infrastructure/db";
import { Author } from "./book";

export class AuthorRepository {
  private toModel(row: any): Author {
    return {
      pkid: row.pkid,
      name: row.name,
      country: row.country ?? undefined,
      birthDate: row.birthDate ?? undefined,
      deathDate: row.deathDate ?? undefined,
      introduction: row.introduction ?? undefined,
    };
  }

  async create(data: Omit<Author, "pkid">): Promise<Author> {
    const created = await prisma.author.create({
      data: {
        name: data.name,
        country: data.country,
        birthDate: data.birthDate,
        deathDate: data.deathDate,
        introduction: data.introduction,
      },
    });
    return this.toModel(created);
  }

  async findByPkid(pkid: number): Promise<Author | null> {
    const found = await prisma.author.findUnique({ where: { pkid } });
    if (!found) return null;
    return this.toModel(found);
  }

  async update(pkid: number, data: Partial<Omit<Author, "pkid">>): Promise<Author> {
    const updated = await prisma.author.update({
      where: { pkid },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.country !== undefined ? { country: data.country } : {}),
        ...(data.birthDate !== undefined ? { birthDate: data.birthDate } : {}),
        ...(data.deathDate !== undefined ? { deathDate: data.deathDate } : {}),
        ...(data.introduction !== undefined ? { introduction: data.introduction } : {}),
      },
    });
    return this.toModel(updated);
  }

  async delete(pkid: number): Promise<boolean> {
    try {
      await prisma.author.delete({ where: { pkid } });
      return true;
    } catch {
      return false;
    }
  }

  async list(): Promise<Author[]> {
    const all = await prisma.author.findMany();
    return all.map(this.toModel);
  }
}
