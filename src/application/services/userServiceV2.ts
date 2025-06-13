import { UserDto } from "@application/dto/userDto";
import { User } from "@domain/models/account/user";
import { UserRepository } from "@domain/models/account/userRepository";

export class UserServiceV2 {
  private repo = new UserRepository();

  async create(user: UserDto): Promise<User> {
    return this.repo.create(user);
  }

  async findByPkid(pkid: number): Promise<User | null> {
    return this.repo.findByPkid(pkid);
  }

  async update(pkid: number, data: Partial<UserDto>): Promise<User | null> {
    return this.repo.update(pkid, data);
  }

  async delete(pkid: number): Promise<boolean> {
    return this.repo.delete(pkid);
  }

  async list(): Promise<User[]> {
    return this.repo.list();
  }
}