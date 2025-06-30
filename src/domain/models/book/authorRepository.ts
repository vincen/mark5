import { prisma } from "@infrastructure/db";
import { Author } from "./book";

export class AuthorRepository {

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
    return {
      pkid: created.pkid,
      name: created.name,
      country: created.country ?? undefined,
      birthDate: created.birthDate ?? undefined,
      deathDate: created.deathDate ?? undefined,
      introduction: created.introduction ?? undefined,
    };
  }

  async findByPkid(pkid: number): Promise<Author | null> {
    const found = await prisma.author.findUnique({ where: { pkid } });
    if (!found) return null;
    return {
      pkid: found.pkid,
      name: found.name,
      country: found.country ?? undefined,
      birthDate: found.birthDate ?? undefined,
      deathDate: found.deathDate ?? undefined,
      introduction: found.introduction ?? undefined,
    };
  }

  /**
   * 更新作者信息
   */
  async update(pkid: number, data: Partial<Omit<Author, "pkid">>): Promise<Author | null> {
    try {
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
      return {
        pkid: updated.pkid,
        name: updated.name,
        country: updated.country ?? undefined,
        birthDate: updated.birthDate ?? undefined,
        deathDate: updated.deathDate ?? undefined,
        introduction: updated.introduction ?? undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * 删除一个作者
   */
  async delete(pkid: number): Promise<boolean> {
    const bookCount = await prisma.bookAuthor.count({ where: { authorId: pkid } });
    if (bookCount > 0) {
      throw new Error("Cannot delete author with associated books.");
    }
    try {
      await prisma.author.delete({ where: { pkid } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 列出所有作者
   */
  async list(): Promise<Author[]> {
    const all = await prisma.author.findMany();
    return all.map((a) => ({
      pkid: a.pkid,
      name: a.name,
      country: a.country ?? undefined,
      birthDate: a.birthDate ?? undefined,
      deathDate: a.deathDate ?? undefined,
      introduction: a.introduction ?? undefined,
    }));
  }
}
