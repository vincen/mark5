import { prisma } from "@infrastructure/db";
import { Book } from "./book";

export class BookRepository {
  /**
   * 创建一本书，并建立多对多／多对一关联
   */
  async create(data: Omit<Book, "pkid">): Promise<Book> {
    const created = await prisma.book.create({
      data: {
        title: data.title,
        isbn: data.isbn,
        price: data.price,
        edition: data.edition,
        printing: data.printing,
        imageUrl: data.imageUrl,
        remark: data.remark,

        // 多对一：publisher
        publisher: { connect: { pkid: data.publisherId } },

        // 多对多：authors
        bookAuthors: {
          create: data.authorIds.map((authorId) => ({
            author: { connect: { pkid: authorId } },
          })),
        },

        // 多对多：translators（可选）
        ...(data.translatorIds && data.translatorIds.length > 0
          ? {
              bookTranslators: {
                create: data.translatorIds.map((translatorId) => ({
                  translator: { connect: { pkid: translatorId } },
                })),
              },
            }
          : {}),
      },
      include: {
        // include raw fk arrays
        bookAuthors: { select: { authorId: true } },
        bookTranslators: { select: { translatorId: true } },
      },
    });

    return {
      pkid: created.pkid,
      title: created.title,
      isbn: created.isbn,
      price: created.price,
      edition: created.edition,
      printing: created.printing,
      imageUrl: created.imageUrl,
      remark: created.remark ?? undefined,

      authorIds: created.bookAuthors.map((ba) => ba.authorId),
      translatorIds: created.bookTranslators.length ? created.bookTranslators.map((bt) => bt.translatorId) : undefined,
      publisherId: created.publisherId,
    };
  }

  /**
   * Find a book by primary key id, including relations
   */
  async findByPkid(pkid: number): Promise<
    | (Book & {
        authors?: { pkid: number; name: string }[];
        translators?: { pkid: number; name: string }[];
        publisher?: { pkid: number; name: string };
      })
    | null
  > {
    const found = await prisma.book.findUnique({
      where: { pkid },
      include: {
        bookAuthors: {
          select: { author: { select: { pkid: true, name: true } } },
        },
        bookTranslators: {
          select: { translator: { select: { pkid: true, name: true } } },
        },
        publisher: { select: { pkid: true, name: true } },
      },
    });
    if (!found) return null;

    return {
      pkid: found.pkid,
      title: found.title,
      isbn: found.isbn,
      price: found.price,
      edition: found.edition,
      printing: found.printing,
      imageUrl: found.imageUrl,
      remark: found.remark ?? undefined,

      authorIds: found.bookAuthors.map((ba) => ba.author.pkid),
      translatorIds: found.bookTranslators.length ? found.bookTranslators.map((bt) => bt.translator.pkid) : undefined,
      publisherId: found.publisherId,

      // 额外附带的关联对象
      authors: found.bookAuthors.map((ba) => ba.author),
      translators: found.bookTranslators.map((bt) => bt.translator),
      publisher: found.publisher,
    };
  }

  /**
   * 按 ISBN 查找一本书
   */
  async findByIsbn(isbn: string): Promise<Book | null> {
    const found = await prisma.book.findUnique({
      where: { isbn },
      select: {
        pkid: true,
        title: true,
        isbn: true,
        price: true,
        edition: true,
        printing: true,
        imageUrl: true,
        remark: true,
        publisherId: true,
        bookAuthors: { select: { authorId: true } },
        bookTranslators: { select: { translatorId: true } },
      },
    });
    if (!found) return null;
    return {
      pkid: found.pkid,
      title: found.title,
      isbn: found.isbn,
      price: found.price,
      edition: found.edition,
      printing: found.printing,
      imageUrl: found.imageUrl,
      remark: found.remark ?? undefined,

      authorIds: found.bookAuthors.map((ba) => ba.authorId),
      translatorIds: found.bookTranslators.length ? found.bookTranslators.map((bt) => bt.translatorId) : undefined,
      publisherId: found.publisherId,
    };
  }

  /** Count book by publisher id */
  async countByPublisher(publisherId: number): Promise<number> {
    return prisma.book.count({ where: { publisherId } });
  }

  /** Count book by author id */
  async countByAuthor(authorId: number): Promise<number> {
    return prisma.bookAuthor.count({ where: { authorId } });
  }

  async countByTranslator(translatorId: number): Promise<number> {
    return prisma.bookTranslator.count({ where: { translatorId } });
  }

  /**
   * 更新一本书，含关系重置
   */
  async update(pkid: number, data: Partial<Omit<Book, "pkid">>): Promise<Book> {
    // 构建 update 对象
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.isbn !== undefined) updateData.isbn = data.isbn;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.edition !== undefined) updateData.edition = data.edition;
    if (data.printing !== undefined) updateData.printing = data.printing;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.remark !== undefined) updateData.remark = data.remark;

    if (data.publisherId !== undefined) {
      updateData.publisher = { connect: { pkid: data.publisherId } };
    }

    if (data.authorIds !== undefined) {
      updateData.bookAuthors = {
        // 先清空再 connect 新的一组
        deleteMany: {},
        create: data.authorIds.map((authorId) => ({
          author: { connect: { pkid: authorId } },
        })),
      };
    }

    if (data.translatorIds !== undefined) {
      updateData.bookTranslators = {
        deleteMany: {},
        ...(data.translatorIds.length
          ? {
              create: data.translatorIds.map((translatorId) => ({
                translator: { connect: { pkid: translatorId } },
              })),
            }
          : {}),
      };
    }

    // 执行更新
    const updated = await prisma.book.update({
      where: { pkid },
      data: updateData,
      include: {
        bookAuthors: { select: { authorId: true } },
        bookTranslators: { select: { translatorId: true } },
      },
    });
    return {
      pkid: updated.pkid,
      title: updated.title,
      isbn: updated.isbn,
      price: updated.price,
      edition: updated.edition,
      printing: updated.printing,
      imageUrl: updated.imageUrl,
      remark: updated.remark ?? undefined,

      authorIds: updated.bookAuthors.map((ba) => ba.authorId),
      translatorIds: updated.bookTranslators.length ? updated.bookTranslators.map((bt) => bt.translatorId) : undefined,
      publisherId: updated.publisherId,

            // 额外附带的关联对象
      authors: found.bookAuthors.map((ba) => ba.author),
      translators: found.bookTranslators.map((bt) => bt.translator),
      publisher: found.publisher,
    };
  }

  /**
   * Delete a book by primary key id
   */
  async delete(pkid: number): Promise<boolean> {
    try {
      await prisma.book.delete({ where: { pkid } });
      return true;
    } catch {
      return false;
    }
  }

  async list(): Promise<
    (Book & {
      authors: { pkid: number; name: string }[];
      translators?: { pkid: number; name: string }[];
      publisher: { pkid: number; name: string };
    })[]
  > {
    const books = await prisma.book.findMany({
      include: {
        bookAuthors: {
          select: { author: { select: { pkid: true, name: true } } },
        },
        bookTranslators: {
          select: { translator: { select: { pkid: true, name: true } } },
        },
        publisher: { select: { pkid: true, name: true } },
      },
    });
    return books.map((b) => ({
      pkid: b.pkid,
      title: b.title,
      isbn: b.isbn,
      price: b.price,
      edition: b.edition,
      printing: b.printing,
      imageUrl: b.imageUrl,
      remark: b.remark ?? undefined,

      authorIds: b.bookAuthors.map((ba) => ba.author.pkid),
      translatorIds: b.bookTranslators.length ? b.bookTranslators.map((bt) => bt.translator.pkid) : undefined,
      publisherId: b.publisherId,

      authors: b.bookAuthors.map((ba) => ba.author),
      translators: b.bookTranslators.map((bt) => bt.translator),
      publisher: b.publisher,
    }));
  }
}
