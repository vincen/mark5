import { prisma } from "@infrastructure/db";
import { User, Gender } from "./user";

export class UserRepository {
  private toModel(row: any): User {
    return {
      pkid: row.pkid,
      name: row.name,
      email: row.email,
      birthdate: row.birthdate,
      gender: row.gender as Gender,
      height: row.height,
      status: row.status,
    };
  }

  async create(user: Omit<User, 'pkid'>): Promise<User> {
    const row = await prisma.mark5_user.create({ data: user });
    return this.toModel(row);
  }

  async findByPkid(pkid: number): Promise<User | null> {
    const row = await prisma.mark5_user.findUnique({ where: { pkid: +pkid } });
    return row ? this.toModel(row) : null;
  }

  async update(pkid: number, data: Partial<Omit<User, 'pkid'>>): Promise<User | null> {
    const row = await prisma.mark5_user.update({ where: { pkid: +pkid }, data });
    return this.toModel(row);
  }

  async delete(pkid: number): Promise<boolean> {
    await prisma.mark5_user.delete({ where: { pkid: +pkid } });
    return true;
  }

  async list(): Promise<User[]> {
    const rows = await prisma.mark5_user.findMany();
    return rows.map(this.toModel);
  }
}