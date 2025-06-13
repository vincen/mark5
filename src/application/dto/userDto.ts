import { User } from "@domain/models/account/user";

export interface UserDto extends Omit<User, 'pkid'> {}