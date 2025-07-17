import { Book } from "@domain/models/book/book";

export interface BookDto extends Omit<Book, 'pkid'> {}