import { describe, it, expect, vi, afterAll, beforeAll } from "vitest";
import { BookService } from "@application/services/bookService";
import { BookRepository } from "@domain/models/book/bookRepository";
import { Book } from "@domain/models/book/book";

// A sample book object for testing
const sampleBook: Book = {
  pkid: 1,
  title: "Sample Title",
  isbn: "123-456",
  price: 19.99,
  edition: "1st",
  printing: "2025-06",
  imageUrl: "http://example.com/cover.jpg",
  remark: "Test remark",
  authorIds: [10, 11],
  translatorIds: [20],
  publisherId: 5,
};

describe("BookService", () => {
  let service: BookService;

  beforeAll(() => {
    service = new BookService();
    // Clear all mocks before each test
    vi.restoreAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it("should create a book", async () => {
    const createSpy = vi.spyOn(BookRepository.prototype, "create").mockResolvedValue(sampleBook);

    const data = { ...sampleBook, pkid: undefined } as Omit<Book, "pkid">;
    const result = await service.create(data);

    expect(createSpy).toHaveBeenCalledWith(data);
    expect(result).toEqual(sampleBook);
  });

  it("should find a book by pkid", async () => {
    const findSpy = vi.spyOn(BookRepository.prototype, "findByPkid").mockResolvedValue(sampleBook);

    const result = await service.findByPkid(1);

    expect(findSpy).toHaveBeenCalledWith(1);
    expect(result).toEqual(sampleBook);
  });

  it("should return null when book not found", async () => {
    vi.spyOn(BookRepository.prototype, "findByPkid").mockResolvedValue(null);

    const result = await service.findByPkid(999);

    expect(result).toBeNull();
  });

  it("should update a book when exists", async () => {
    const updates: Partial<Omit<Book, "pkid">> = { title: "New Title" };
    const updatedBook = { ...sampleBook, ...updates };
    const updateSpy = vi.spyOn(BookRepository.prototype, "update").mockResolvedValue(updatedBook);

    const result = await service.update(1, updates);

    expect(updateSpy).toHaveBeenCalledWith(1, updates);
    expect(result).toEqual(updatedBook);
  });

  it("should return null when updating non-existent book", async () => {
    vi.spyOn(BookRepository.prototype, "update").mockResolvedValue(null);

    const result = await service.update(999, { title: "Nope" });

    expect(result).toBeNull();
  });

  it("should delete a book successfully", async () => {
    const deleteSpy = vi.spyOn(BookRepository.prototype, "delete").mockResolvedValue(true);

    const result = await service.delete(1);

    expect(deleteSpy).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  it("should return false when deleting non-existent book", async () => {
    vi.spyOn(BookRepository.prototype, "delete").mockResolvedValue(false);

    const result = await service.delete(999);

    expect(result).toBe(false);
  });

  it("should list all books", async () => {
    const listSpy = vi.spyOn(BookRepository.prototype, "list").mockResolvedValue([sampleBook]);

    const result = await service.list();

    expect(listSpy).toHaveBeenCalled();
    expect(result).toEqual([sampleBook]);
  });
});
