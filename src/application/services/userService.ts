import { User } from "@domain/models/user";
import { UserRepository } from "@domain/repositories/userRepository";

export class UserService {
  private repo = new UserRepository();

  async create(user: Omit<User, 'pkid'>): Promise<User> {
    return this.repo.create(user);
  }

  async findByPkid(pkid: number): Promise<User | null> {
    return this.repo.findByPkid(pkid);
  }

  async update(pkid: number, data: Partial<Omit<User, 'pkid'>>): Promise<User | null> {
    return this.repo.update(pkid, data);
  }

  async delete(pkid: number): Promise<boolean> {
    return this.repo.delete(pkid);
  }

  async list(): Promise<User[]> {
    return this.repo.list();
  }
}