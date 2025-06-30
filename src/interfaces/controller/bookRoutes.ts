// import { FastifyInstance } from 'fastify'
// import { BookService } from '@application/services/bookService'
// import { CreateBookForm, UpdateBookForm } from '@interfaces/dto/bookForm'
// import {
//   listBooksSchema,
//   getBookSchema,
//   createBookSchema,
//   updateBookSchema,
//   deleteBookSchema,
// } from '@interfaces/schema/bookSchema'

// const service = new BookService()

// export default async function bookRoutes(fastify: FastifyInstance) {
//   // List
//   fastify.get<{ Reply: any[] }>(
//     '/books',
//     { schema: { ...listBooksSchema, tags: ['book'] } },
//     async (_, reply) => {
//       const list = await service.list()
//       reply.send(list)
//     }
//   )

//   // Get by ID
//   fastify.get<{ Params:{id:number}; Reply:any }>(
//     '/books/:id',
//     { schema: { ...getBookSchema, tags: ['book'] } },
//     async (req, reply) => {
//       const book = await service.findByPkid(req.params.id)
//       if (!book) return reply.code(404).send({ message: 'Book not found' })
//       reply.send(book)
//     }
//   )

//   // Create
//   fastify.post<{ Body:CreateBookForm; Reply:any }>(
//     '/books',
//     { schema: { ...createBookSchema, tags: ['book'] } },
//     async (req, reply) => {
//       const created = await service.create(req.body)
//       reply.code(201).send(created)
//     }
//   )

//   // Update
//   fastify.put<{ Params:{id:number}; Body:UpdateBookForm; Reply:any }>(
//     '/books/:id',
//     { schema: { ...updateBookSchema, tags: ['book'] } },
//     async (req, reply) => {
//       const updated = await service.update(req.params.id, req.body)
//       if (!updated) return reply.code(404).send({ message: 'Book not found' })
//       reply.send(updated)
//     }
//   )

//   // Delete
//   fastify.delete<{ Params:{id:number}; Reply:null|{message:string} }>(
//     '/books/:id',
//     { schema: { ...deleteBookSchema, tags: ['book'] } },
//     async (req, reply) => {
//       const ok = await service.delete(req.params.id)
//       if (!ok) {
//         return reply
//           .code(409)
//           .send({ message: 'Cannot delete book: it may have associated records or does not exist' })
//       }
//       reply.code(204).send()
//     }
//   )
// }
