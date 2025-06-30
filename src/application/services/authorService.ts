import { Author } from '@domain/models/book/book'
import { AuthorRepository } from '@domain/models/book/authorRepository'
import { AuthorDto } from '@application/dto/authorDto'

export class AuthorService {
  private repo = new AuthorRepository()

  /** 创建作者/译者 */
  async create(data: AuthorDto): Promise<Author> {
    return this.repo.create(data)
  }

  /** 根据主键查找作者 */
  async findByPkid(pkid: number): Promise<Author | null> {
    return this.repo.findByPkid(pkid)
  }

  /** 更新作者信息 */
  async update(pkid: number, updates: Partial<Omit<Author, 'pkid'>>): Promise<Author | null> {
    return this.repo.update(pkid, updates)
  }

  /** 删除作者；如有关联则返回 false */
  async delete(pkid: number): Promise<boolean> {
    return this.repo.delete(pkid)
  }

  /** 列出所有作者/译者 */
  async list(): Promise<Author[]> {
    return this.repo.list()
  }
}
