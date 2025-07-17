import { FastifyInstance, FastifySchema } from "fastify";
import { AuthorService } from "@application/services/authorService";
import { CreateAuthorForm, UpdateAuthorForm } from "@interfaces/form/authorForm";
import { Author } from "@domain/models/book/book";
import { AuthorDto } from "@application/dto/authorDto";
import { conflict, ErrorReply, HTTP_4xx_SCHEMA, ID_PARAM_SCHEMA, IdParam, notFound, NotFoundReply } from "@interfaces/shared/httpDef";
import { NotFoundError, RelatedEntityError } from "@domain/shared/error";

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
  properties: { pkid: { type: "integer" }, ...authorBase },
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
  params: ID_PARAM_SCHEMA,
  response: {
    200: authorSchema,
    404: HTTP_4xx_SCHEMA,
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
  params: ID_PARAM_SCHEMA,
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
  params: ID_PARAM_SCHEMA,
  response: {
    204: { type: "null" },
    404: HTTP_4xx_SCHEMA,
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
  fastify.get<{ Reply: Author[] }>("/authors", { schema: listAuthorsSchema }, async (_, reply) => {
    reply.send(await service.list());
  });

  // Get by ID
  fastify.get<{ Params: { id: number }; Reply: Author | NotFoundReply }>(
    "/authors/:id",
    { schema: getAuthorSchema },
    async (req, reply) => {
      const author = await service.findByPkid(req.params.id);
      if (!author) return notFound(reply);
      reply.send(author);
    }
  );

  // Create
  fastify.post<{ Body: CreateAuthorForm; Reply: Author }>("/authors", { schema: createAuthorSchema },
    async (req, reply) => {
      const authorDto: AuthorDto = toAuthorDto(req.body);
      const created = await service.create(authorDto);
      reply.code(201).send(created);
    }
  );

  // Update
  fastify.put<{ Params: { id: number }; Body: UpdateAuthorForm; Reply: Author | ErrorReply }>(
    "/authors/:id",
    { schema: updateAuthorSchema },
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
  fastify.delete<{ Params: IdParam; Reply: null | ErrorReply }>(
    "/authors/:id",
    { schema: deleteAuthorSchema },
    async (req, reply) => {
      try {
        const deleted = await service.delete(req.params.id);
        if (!deleted) {
          return "{ message: 'Unknow error when deleting publisher' }"
        }
        reply.code(204).send();
      } catch (error) {
        if (error instanceof NotFoundError) {
          return notFound(reply);
        } else if (error instanceof RelatedEntityError) {
          return conflict(reply, error.message);
        }
        throw error; // Re-throw other errors to be handled by global error handler
      }
    }
  );
}
