import { FastifyInstance, FastifySchema } from "fastify";
import { BookService } from "@application/services/bookService";
import { badRequest, ErrorReply, HTTP_4xx_SCHEMA, IdParam, ID_PARAM_SCHEMA, notFound } from "@interfaces/shared/httpDef";
import { CreateBookForm, UpdateBookForm } from "@interfaces/form/bookForm";
import { AuthorService } from "@application/services/authorService";
import { PublisherService } from "@application/services/publisherService";
import { BookDto } from "@application/dto/bookDto";
import { NotFoundError } from "@domain/shared/error";

const BOOK_TAG = "books-v1";

/** 通用的最简实体（用于 Author/Translator/Publisher） */
const entityMinimal = {
  type: 'object',
  properties: {
    pkid: { type: 'integer' },
    name: { type: 'string' },
  },
  required: ['pkid', 'name'],
  additionalProperties: false,
} as const

const bookBase = {
  title:           { type: 'string', minLength: 1 },
  isbn:            { type: 'string', minLength: 1 },
  price:           { type: 'number', minimum: 0 },
  edition:         { type: 'string' },
  printing:        { type: 'string' },
  imageUrl:        { type: 'string', format: 'uri' },
  remark:          { type: 'string' },
  authorIds:       { type: 'array', items: { type: 'integer' }, minItems: 1 },
  authorNames:     { type: 'array', items: { type: 'string' }, minItems: 1 },
  translatorIds:   { type: 'array', items: { type: 'integer' } },
  translatorNames: { type: 'array', items: { type: 'string' } },
  publisherId:     { type: 'integer' },
  publisherName:   { type: 'string' },
} as const

/** 200 响应的完整 Book schema */
const bookFullResponse = {
  type: 'object',
  properties: {
    pkid: { type: 'integer' },
    ...bookBase,
    authors: {
      type: 'array',
      items: entityMinimal,
    },
    translators: {
      type: 'array',
      items: entityMinimal,
    },
    publisher: entityMinimal,
  },
  required: [
    'pkid',
    'title',
    'isbn',
    'price',
    'edition',
    'printing',
    'imageUrl',
    'authorIds',
    'translatorIds',
    'publisherId',
    'authors',
    'translators',
    'publisher',
  ],
  additionalProperties: false,
} as const

// GET /books/:id
const getBookSchema: FastifySchema = {
  tags: [BOOK_TAG],
  params: ID_PARAM_SCHEMA,
  response: {
    200: bookFullResponse,
    404: HTTP_4xx_SCHEMA,
  },
}

// GET /books
const listBooksSchema: FastifySchema = {
  tags: [BOOK_TAG],
  response: {
    200: {
      type: 'array',
      items: bookFullResponse,
    },
  },
}

// POST /books
const createBookSchema: FastifySchema = {
  tags: [BOOK_TAG],
  body: {
    type: 'object',
    properties: {
      ...bookBase,
    },
    // 要求至少传 authorIds 或 authorNames，及 publisherId 或 publisherName
    oneOf: [
      { required: ['authorIds'] },
      { required: ['authorNames'] },
    ],
    additionalProperties: false,
  },
  response: {
    201: bookFullResponse,
  },
}

// PUT /books/:id
const updateBookSchema: FastifySchema = {
  tags: [BOOK_TAG],
  params: ID_PARAM_SCHEMA,
  body: {
    type: 'object',
    properties: {
      ...bookBase,
    },
    // 至少修改一个字段
    minProperties: 1,
    additionalProperties: false,
  },
  response: {
    200: bookFullResponse,
    404: HTTP_4xx_SCHEMA,
  },
}

// DELETE /books/:id
const deleteBookSchema: FastifySchema = {
  tags: [BOOK_TAG],
  params: ID_PARAM_SCHEMA,
  response: {
    204: { type: 'null' },
    409: HTTP_4xx_SCHEMA,
    404: HTTP_4xx_SCHEMA,
  },
}

export default async function bookRoutes(fastify: FastifyInstance) {
  const bookService = new BookService();
  const authorsService = new AuthorService();
  const publishersService = new PublisherService();

  // List all books with full related entities
  fastify.get<{ Reply: any[] }>("/books", { schema: listBooksSchema }, async (_, reply) => {
    const list = await bookService.list();
    reply.send(list);
  });

  // Get by ID
  fastify.get<{ Params: IdParam; Reply: any }>("/books/:id", { schema: getBookSchema }, async (req, reply) => {
    const book = await bookService.findByPkid(req.params.id);
    if (!book) return notFound(reply);
    reply.send(book);
  });

  // Create
  fastify.post<{ Body: CreateBookForm; Reply: any }>("/books", { schema: createBookSchema }, async (req, reply) => {
    // authors
    let authorIds: number[] = req.body.authorIds ?? [];
    if (authorIds.length === 0) {
      if (!req.body.authorNames?.length) {
        return badRequest(reply, "At least one author is required");
      }
      authorIds = await authorsService.createAuthors(req.body.authorNames);
    }
    // publisher
    let publisherId: number = req.body.publisherId ?? 0;
    if (publisherId <= 0) {
      if (!req.body.publisherName) {
        return badRequest(reply, "Publisher is required");
      }
      publisherId = (await publishersService.create({ name: req.body.publisherName })).pkid;
    }
    // translators
    let translatorIds: number[] = req.body.translatorIds ?? [];
    if (!translatorIds?.length && req.body.translatorNames?.length) {
      translatorIds = await authorsService.createAuthors(req.body.translatorNames);
    }
    // construct a dto object
    const bookDto: BookDto = {
      title: req.body.title,
      isbn: req.body.isbn,
      price: req.body.price,
      edition: req.body.edition,
      printing: req.body.printing,
      imageUrl: req.body.imageUrl,
      remark: req.body.remark,
      authorIds,
      publisherId,
      translatorIds,
    };
    const created = await bookService.create(bookDto);
    const full = await bookService.findByPkid(created.pkid);
    reply.code(201).send(full);
  });

  // Update
  fastify.put<{ Params: IdParam; Body: UpdateBookForm; Reply: any }>(
    "/books/:id",
    { schema: updateBookSchema },
    async (req, reply) => {
      const form = req.body;
      // authors
      let authorIds: number[] = form.authorIds ?? [];
      if (authorIds.length === 0) {
        if (!form.authorNames?.length) {
          return badRequest(reply, "At least one author is required");
        }
        authorIds = await authorsService.createAuthors(form.authorNames);
      }
      // publisher
      let publisherId: number = form.publisherId ?? 0;
      if (publisherId <= 0) {
        if (!form.publisherName) {
          return badRequest(reply, "Publisher is required");
        }
        publisherId = (await publishersService.create({ name: form.publisherName })).pkid;
      }
      // translators
      let translatorIds: number[] = form.translatorIds ?? [];
      if (!translatorIds?.length && form.translatorNames?.length) {
        translatorIds = await authorsService.createAuthors(form.translatorNames);
      }
      // construct a dto object
      const updateDto: any = {
        ...(form.title        !== undefined && { title: form.title }),
        ...(form.isbn         !== undefined && { isbn: form.isbn }),
        ...(form.price        !== undefined && { price: form.price }),
        ...(form.edition      !== undefined && { edition: form.edition }),
        ...(form.printing     !== undefined && { printing: form.printing }),
        ...(form.imageUrl     !== undefined && { imageUrl: form.imageUrl }),
        ...(form.remark       !== undefined && { remark: form.remark }),
        authorIds,                // 保证一定有数组
        publisherId,              // 保证一定有值
        ...(translatorIds && { translatorIds }),
      }

      try {
        const updated = await bookService.update(req.params.id, updateDto);
        reply.send(updated);
      } catch (error) {}
    }
  );

  // Delete
  fastify.delete<{ Params: IdParam; Reply: null | ErrorReply }>(
    "/books/:id",
    { schema: deleteBookSchema },
    async (req, reply) => {
      try {
        const deleted = await bookService.delete(req.params.id);
        if (!deleted) {
          return "{ message: 'Unknow error when deleting book' }"
        }
        return reply.status(204).send();
      } catch (error) {
        if (error instanceof NotFoundError) {
          return notFound(reply);
        }
        throw error; // Re-throw unexpected errors
      }

    }
  );
}
