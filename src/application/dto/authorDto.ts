import { Author } from "@domain/models/book/book";

export interface AuthorDto extends Omit<Author, 'pkid'> {}