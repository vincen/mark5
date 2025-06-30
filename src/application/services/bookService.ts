import { Book } from '@domain/models/book/book'
import { BookRepository } from '@domain/models/book/bookRepository'

export class BookService {
  private repo = new BookRepository()

  /**
   * 创建一本书
   * @param data - 不含 pkid 的 Book 对象
   * @returns 新创建的 Book（含 pkid、relation IDs）
   */
  async create(data: Omit<Book, 'pkid'>): Promise<Book> {
    return this.repo.create(data)
  }

  /**
   * 根据 pkid 查询一本书
   * @param pkid - 书籍主键
   * @returns 包含 relation IDs 的 Book，找不到返回 null
   */
  async findByPkid(pkid: number): Promise<Book | null> {
    return this.repo.findByPkid(pkid)
  }

  /**
   * 更新一本书
   * @param pkid - 书籍主键
   * @param updates - 部分更新字段
   * @returns 更新后的 Book 或 null（如果不存在）
   */
  async update(
    pkid: number,
    updates: Partial<Omit<Book, 'pkid'>>
  ): Promise<Book | null> {
    return this.repo.update(pkid, updates)
  }

  /**
   * 删除一本书
   * @param pkid - 书籍主键
   * @returns true 表示删除成功，false 表示该书不存在
   */
  async delete(pkid: number): Promise<boolean> {
    return this.repo.delete(pkid)
  }

  /**
   * 列出所有书
   * @returns Book 数组（只含基础字段和 relation IDs）
   */
  async list(): Promise<Book[]> {
    return this.repo.list()
  }

  /** Count book by publisher id */
  async countByPublisher(publisherId: number): Promise<number> {
    return this.repo.countByPublisher(publisherId)
  }
}
