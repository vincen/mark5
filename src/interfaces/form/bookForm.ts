export interface CreateBookForm {
  title: string
  isbn: string
  price: number
  edition: string
  printing: string
  imageUrl: string
  remark?: string

  authorIds: number[]
  translatorIds?: number[]
  publisherId: number
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
  translatorIds?: number[]
  publisherId?: number
}
