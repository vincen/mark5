import { BookDto } from "@application/dto/bookDto";
import { Book } from "@domain/models/book/book";
import { BookRepository } from "@domain/models/book/bookRepository";
import { AlreadyExistsError, NotFoundError } from "@domain/shared/error";

export class BookService {
  private repo = new BookRepository();

  async create(data: BookDto): Promise<Book> {
    return this.repo.create(data);
  }

  async findByPkid(pkid: number): Promise<Book | null> {
    return this.repo.findByPkid(pkid);
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return this.repo.findByIsbn(isbn);
  }

  async update(pkid: number, updates: Partial<BookDto>): Promise<Book> {
    // Check if book exists
    const existingBook = await this.findByPkid(pkid);
    if (!existingBook) {
      throw new NotFoundError("Book", pkid);
    }
    // Check if ISBN is being updated and if it already exists
    if (updates.isbn && updates.isbn !== existingBook.isbn) {
      const existingIsbnBook = await this.repo.findByIsbn(updates.isbn);
      if (existingIsbnBook && existingIsbnBook.pkid !== pkid) {
        // throw new Error(`ISBN ${updates.isbn} already exists for another book.`);
        throw new AlreadyExistsError("Book ISBN", updates.isbn);
      }
    }

    // Validate updates
    if (updates.title && updates.title.trim() === "") { // Remove empty title
      delete updates.title;
    }
    if (updates.isbn && updates.isbn.trim() === "") { // Remove empty isbn
      delete updates.isbn;
    }
    if (updates.price && updates.price <= 0) {
      delete updates.price; // Remove invalid price
    }
    if (updates.edition && updates.edition.trim() === "") {
      delete updates.edition; // Remove invalid edition
    }
    if (updates.printing && updates.printing.trim() === "") {
      delete updates.printing; // Remove invalid printing
    }
    if (updates.imageUrl && updates.imageUrl === "") {
      delete updates.imageUrl; // Remove empty imageUrl
    }
    if (updates.remark && updates.remark === "") {
      delete updates.remark; // Remove empty remark
    }
    // Remove relationships that are not provided in updates
    if (updates.authorIds && updates.authorIds.length === 0) {
      delete updates.authorIds; // Remove empty authorIds
    }
    if (updates.translatorIds && updates.translatorIds.length === 0) {
      delete updates.translatorIds; // Remove empty translatorIds
    }
    if (updates.publisherId && updates.publisherId <= 0) {
      delete updates.publisherId; // Remove invalid publisherId
    }

    // Perform the update
    if (Object.keys(updates).length === 0) {
      throw new Error("No valid fields to update.");
    }
    return this.repo.update(pkid, updates);
  }

  async delete(pkid: number): Promise<boolean> {
    // Check if book exists
    const existingBook = await this.findByPkid(pkid);
    if (!existingBook) {
      throw new NotFoundError("Book", pkid);
    }
    return this.repo.delete(pkid);
  }

  async list(): Promise<Book[]> {
    return this.repo.list();
  }

  /** Count book by publisher id */
  async countByPublisher(publisherId: number): Promise<number> {
    return this.repo.countByPublisher(publisherId);
  }

  /** Count book by author id */
  async countByAuthor(authorId: number): Promise<number> {
    return this.repo.countByAuthor(authorId);
  }

  /** Count book by translator id */
  async countByTranslator(translatorId: number): Promise<number> {
    return this.repo.countByTranslator(translatorId);
  }
}
