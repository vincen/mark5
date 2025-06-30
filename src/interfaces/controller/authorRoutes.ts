import { FastifyInstance, FastifySchema } from 'fastify'
import { AuthorService } from '@application/services/authorService'
import { CreateAuthorForm, UpdateAuthorForm } from '@interfaces/form/authorForm'
import { Author } from '@domain/models/book/book'
import { AuthorDto } from '@application/dto/authorDto'

const AUTHOR_TAG = 'authors-v1'

const authorBase = {
  name:         { type: 'string', minLength: 1 },
  country:      { type: 'string' },
  birthDate:    { type: 'string', format: 'date' },
  deathDate:    { type: 'string', format: 'date' },
  introduction: { type: 'string' },
}

const authorSchema = {
  type: 'object',
  properties: {
    pkid: { type: 'integer' },
    ...authorBase,
  },
  required: ['pkid', 'name'],
  additionalProperties: false,
}

export const listAuthorsSchema: FastifySchema = {
  response: {
    200: {
      type: 'array',
      items: authorSchema,
    },
  },
}

export const getAuthorSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'integer', minimum: 1 } },
    required: ['id'],
  },
  response: {
    200: authorSchema,
    404: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}

export const createAuthorSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: authorBase,
    required: ['name'],
    additionalProperties: false,
  },
  response: {
    201: authorSchema,
  },
}

export const updateAuthorSchema: FastifySchema = {
  params: getAuthorSchema.params,
  body: {
    type: 'object',
    properties: authorBase,
    additionalProperties: false,
    minProperties: 1,
  },
  response: getAuthorSchema.response,
}

export const deleteAuthorSchema: FastifySchema = {
  params: getAuthorSchema.params,
  response: {
    204: { type: 'null' },
    409: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
    404: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}

export default async function authorRoutes(fastify: FastifyInstance) {
  const service = new AuthorService()
  // List
  fastify.get<{ Reply: Author[] }>(
    '/authors',
    { schema: { ...listAuthorsSchema, tags: ['author'] } },
    async (_, reply) => {
      reply.send(await service.list())
    }
  )

  // Get by ID
  fastify.get<{ Params:{id:number}; Reply: Author | NotFoundReply }>(
    '/authors/:id',
    { schema: { ...getAuthorSchema, tags: [AUTHOR_TAG] } },
    async (req, reply) => {
      const author = await service.findByPkid(req.params.id)
      if (!author) return reply.code(404).send({ message: 'Author not found' })
      reply.send(author)
    }
  )

  // Create
  fastify.post<{ Body:CreateAuthorForm; Reply:Author }>(
    '/authors',
    { schema: { ...createAuthorSchema, tags: [AUTHOR_TAG] } },
    async (req, reply) => {
      const authorDto: AuthorDto = {
        ...req.body,
        ...(req.body.birthDate ? { birthDate: new Date(req.body.birthDate) } : undefined),
        ...(req.body.deathDate ? { deathDate: new Date(req.body.deathDate) } : undefined)
      }
      const created = await service.create(authorDto)
      reply.code(201).send(created)
    }
  )

  // Update
  fastify.put<{ Params:{id:number}; Body:UpdateAuthorForm; Reply:Author | NotFoundReply }>(
    '/authors/:id',
    { schema: { ...updateAuthorSchema, tags: [AUTHOR_TAG] } },
    async (req, reply) => {
      const updated = await service.update(req.params.id, req.body)
      if (!updated) return reply.code(404).send({ message: 'Author not found' })
      reply.send(updated)
    }
  )

  // Delete
  fastify.delete<{ Params:{id:number}; Reply:null|{message:string} }>(
    '/authors/:id',
    { schema: { ...deleteAuthorSchema, tags: [AUTHOR_TAG] } },
    async (req, reply) => {
      const ok = await service.delete(req.params.id)
      if (!ok) {
        return reply
          .code(409)
          .send({ message: 'Cannot delete author: they may be associated with books' })
      }
      reply.code(204).send()
    }
  )
}
