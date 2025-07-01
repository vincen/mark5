import { FastifyInstance, FastifySchema } from "fastify";
import { AuthorService } from "@application/services/authorService";
import { CreateAuthorForm, UpdateAuthorForm } from "@interfaces/form/authorForm";
import { Author } from "@domain/models/book/book";
import { AuthorDto } from "@application/dto/authorDto";
import { ErrorReply, HTTP_404_SCHEMA, notFound, NotFoundReply } from "@interfaces/shared/httpDef";
import { NotFoundError } from "@domain/shared/error";

const AUTHOR_TAG = "authors-v1";

const authorBase = {
  name: { type: "string", minLength: 1 },
  country: { type: "string" },
  birthDate: { type: "string", format: "date" },
  deathDate: { type: "string", format: "date" },
  introduction: { type: "string" },
};

const authorSchema = {
  type: "object",
  properties: {
    pkid: { type: "integer" },
    ...authorBase,
  },
  required: ["pkid", "name"],
  additionalProperties: false,
};

const listAuthorsSchema: FastifySchema = {
  tags: [AUTHOR_TAG],
  response: {
    200: {
      type: "array",
      items: authorSchema,
    },
  },
};

const getAuthorSchema: FastifySchema = {
  tags: [AUTHOR_TAG],
  params: {
    type: "object",
    properties: { id: { type: "integer", minimum: 1 } },
    required: ["id"],
  },
  response: {
    200: authorSchema,
    404: HTTP_404_SCHEMA,
  },
};

const createAuthorSchema: FastifySchema = {
  tags: [AUTHOR_TAG],
  body: {
    type: "object",
    properties: authorBase,
    required: ["name"],
    additionalProperties: false,
  },
  response: {
    201: authorSchema,
  },
};

const updateAuthorSchema: FastifySchema = {
  tags: [AUTHOR_TAG],
  params: getAuthorSchema.params,
  body: {
    type: "object",
    properties: authorBase,
    additionalProperties: false,
    minProperties: 1,
  },
  response: getAuthorSchema.response,
};

const deleteAuthorSchema: FastifySchema = {
  tags: [AUTHOR_TAG],
  params: getAuthorSchema.params,
  response: {
    204: { type: "null" },
    404: HTTP_404_SCHEMA,
  },
};

function toAuthorDto(data: CreateAuthorForm|UpdateAuthorForm): AuthorDto {
  return {
    name: data.name ? data.name.trim() : "",
    country: data.country,
    introduction: data.introduction,
    birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
    deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
  };
}

export default async function authorRoutes(fastify: FastifyInstance) {
  const service = new AuthorService();
  // List
  fastify.get<{ Reply: Author[] }>("/authors", { schema: { ...listAuthorsSchema } }, async (_, reply) => {
    reply.send(await service.list());
  });

  // Get by ID
  fastify.get<{ Params: { id: number }; Reply: Author | NotFoundReply }>(
    "/authors/:id",
    { schema: { ...getAuthorSchema } },
    async (req, reply) => {
      const author = await service.findByPkid(req.params.id);
      if (!author) return notFound(reply);
      reply.send(author);
    }
  );

  // Create
  fastify.post<{ Body: CreateAuthorForm; Reply: Author }>("/authors", { schema: { ...createAuthorSchema } },
    async (req, reply) => {
      const authorDto: AuthorDto = toAuthorDto(req.body);
      const created = await service.create(authorDto);
      reply.code(201).send(created);
    }
  );

  // Update
  fastify.put<{ Params: { id: number }; Body: UpdateAuthorForm; Reply: Author | ErrorReply }>(
    "/authors/:id",
    { schema: { ...updateAuthorSchema } },
    async (req, reply) => {
      const authorDto: AuthorDto = toAuthorDto(req.body);
      try {
        const updated = await service.update(req.params.id, authorDto);
        reply.send(updated);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return notFound(reply);
        }
        throw error; // Re-throw other errors to be handled by global error handler
      }
    }
  );

  // Delete
  fastify.delete<{ Params: { id: number }; Reply: null | { message: string } }>(
    "/authors/:id",
    { schema: { ...deleteAuthorSchema } },
    async (req, reply) => {
      const ok = await service.delete(req.params.id);
      if (!ok) {
        return reply.code(409).send({ message: "Cannot delete author: they may be associated with books" });
      }
      reply.code(204).send();
    }
  );
}
