export interface CreateBookForm {
  title: string
  isbn: string
  price: number
  edition: string
  printing: string
  imageUrl: string
  remark?: string

  authorIds?: number[]
  authorNames?: string[]
  translatorIds?: number[]
  translatorNames?: string[]
  publisherId?: number
  publisherName?: string
}

export interface UpdateBookForm {
  title?: string
  isbn?: string
  price?: number
  edition?: string
  printing?: string
  imageUrl?: string
  remark?: string

  authorIds?: number[]
  authorNames?: string[]
  translatorIds?: number[]
  translatorNames?: string[]
  publisherId?: number
  publisherName?: string
}
