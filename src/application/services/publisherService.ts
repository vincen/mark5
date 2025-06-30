import { Publisher } from "@domain/models/book/book";
import { PublisherRepository } from "@domain/models/book/publisherRepository";
import { AlreadyExistsError, NotFoundError, RelatedEntityError } from "@domain/shared/error";
import { BookService } from "./bookService";

export class PublisherService {
  private repo = new PublisherRepository();
  private bookService = new BookService();

  async create(data: Omit<Publisher, "pkid">): Promise<Publisher> {
    const existing = await this.findByName(data.name);
    if (existing) {
      throw new AlreadyExistsError("Publisher", data.name);
    }
    return this.repo.create(data);
  }

  async findByPkid(pkid: number): Promise<Publisher | null> {
    return this.repo.findByPkid(pkid);
  }

  async findByName(name: string): Promise<Publisher | null> {
    return this.repo.findByName(name);
  }

  async update(pkid: number, updates: Partial<Omit<Publisher, "pkid">>): Promise<Publisher> {
    // Check if publisher exists
    if (!await this.findByPkid(pkid)) {
      throw new NotFoundError("Publisher", pkid);
    }
    // Check if the name is being updated and if it already exists
    if (updates.name) {
      const existing = await this.findByName(updates.name);
      if (existing && existing.pkid !== pkid) {
        throw new AlreadyExistsError("Publisher", updates.name);
      }
    }
    // Proceed with update
    return this.repo.update(pkid, updates);
  }

  async delete(pkid: number): Promise<boolean> {
    // Check if publisher has associated books
    const count = await this.bookService.countByPublisher(pkid);
    if (count > 0) {
      throw new RelatedEntityError("Publisher", pkid, count);
    }
    // Check if publisher exists
    if (!await this.findByPkid(pkid)) {
      throw new NotFoundError("Publisher", pkid);
    }
    // Proceed with deletion
    return this.repo.delete(pkid);
  }

  async list(): Promise<Publisher[]> {
    return this.repo.list();
  }
}
