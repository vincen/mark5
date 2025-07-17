import { Author } from '@domain/models/book/book'
import { AuthorRepository } from '@domain/models/book/authorRepository'
import { AuthorDto } from '@application/dto/authorDto'
import { BookService } from './bookService'
import { NotFoundError, RelatedEntityError } from '@domain/shared/error'

export class AuthorService {
  private repo = new AuthorRepository()
  private bookService = new BookService()

  async create(data: AuthorDto): Promise<Author> {
    return this.repo.create(data)
  }

  async createAuthors(authorNames: string[]): Promise<number[]> {
    const authorIds: number[] = [];
    for (const name of authorNames) {
      const author = await this.repo.create({ name });
      authorIds.push(author.pkid);
    }
    return authorIds;
  }

  async findByPkid(pkid: number): Promise<Author | null> {
    return this.repo.findByPkid(pkid)
  }

  async update(pkid: number, updates: Partial<AuthorDto>): Promise<Author> {
    // Check if auhtor exists
    if (!await this.findByPkid(pkid)) {
      throw new NotFoundError("Author", pkid);
    }
    return this.repo.update(pkid, updates)
  }

  async delete(pkid: number): Promise<boolean> {
    // Check if author exists
    const existingAuthor = await this.findByPkid(pkid);
    if (!existingAuthor) {
      throw new NotFoundError("Author", pkid);
    }

    // Check if author has associated books
    const bookCount = await this.bookService.countByAuthor(pkid);
    if (bookCount > 0) {
      throw new RelatedEntityError("Author", pkid, bookCount);
    }
    const bookCount2 = await this.bookService.countByTranslator(pkid);
    if (bookCount2 > 0) {
      throw new RelatedEntityError("Author", pkid, bookCount2);
    }

    // Proceed with deletion
    return this.repo.delete(pkid)
  }

  async list(): Promise<Author[]> {
    return this.repo.list()
  }
}
