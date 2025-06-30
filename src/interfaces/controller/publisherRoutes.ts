import { PublisherService } from "@application/services/publisherService";
import { Publisher } from "@domain/models/book/book";
import { AlreadyExistsError, NotFoundError, RelatedEntityError } from "@domain/shared/error";
import { conflict, DuplicatedReply, ErrorReply, HTTP_404_SCHEMA, IdParam, notFound, NotFoundReply } from "@interfaces/shared/httpDef";
import { FastifyInstance } from "fastify";

const PUBLISHER_TAG = "publisher-v1";

const publisherBaseProperties = {
  name: { type: "string", minLength: 1, maxLength: 100 },
};

const publisherSchema = {
  type: "object",
  properties: {
    pkid: { type: "integer" },
    ...publisherBaseProperties,
  },
  required: ["pkid", ...Object.keys(publisherBaseProperties)],
  additionalProperties: false,
};

// GET /publishers
const listPublishersSchema = {
  tags: [PUBLISHER_TAG],
  response: {
    200: {
      type: "array",
      items: publisherSchema,
    },
  },
};

// GET /publishers/:id
const getPublisherSchema = {
  tags: [PUBLISHER_TAG],
  params: {
    type: "object",
    properties: { id: { type: "integer", minimum: 1 } },
    required: ["id"],
  },
  response: {
    200: publisherSchema,
    404: HTTP_404_SCHEMA,
  },
};

// POST /publishers
const createPublisherSchema = {
  tags: [PUBLISHER_TAG],
  body: {
    type: "object",
    properties: { ...publisherBaseProperties },
    required: ["name"],
    additionalProperties: false,
  },
  response: {
    201: publisherSchema,
  },
};

// PUT /publishers/:id
const updatePublisherSchema = {
  tags: [PUBLISHER_TAG],
  params: getPublisherSchema.params,
  body: createPublisherSchema.body,
  response: {
    200: publisherSchema,
    404: HTTP_404_SCHEMA,
  },
};

// DELETE /publishers/:id
const deletePublisherSchema = {
  tags: [PUBLISHER_TAG],
  params: getPublisherSchema.params,
  response: {
    204: { type: "null" },
    404: HTTP_404_SCHEMA,
  },
};

export async function publisherRoutes(fastify: FastifyInstance) {
  const service = new PublisherService();

  fastify.get<{ Reply: Publisher[] }>("/publishers", { schema: listPublishersSchema }, async (request, reply) => {
    const publishers = await service.list();
    return reply.send(publishers);
  });

  fastify.get<{ Params: IdParam; Reply: Publisher | NotFoundReply }>(
    "/publishers/:id",
    { schema: getPublisherSchema },
    async (request, reply) => {
      const publisher = await service.findByPkid(request.params.id);
      if (!publisher) {
        return notFound(reply);
      }
      return reply.send(publisher);
    }
  );

  fastify.post<{ Body: { name: string }; Reply: Publisher | DuplicatedReply}>(
    "/publishers",
    { schema: createPublisherSchema },
    async (request, reply) => {
      try {
        const publisher = await service.create(request.body);
        return reply.status(201).send(publisher);
      } catch (error) {
        if (error instanceof AlreadyExistsError) {
          return conflict(reply, error.message);
        }
        throw error; // Re-throw unexpected errors
      }
    }
  );

  fastify.put<{ Params: IdParam; Body: { name: string }; Reply: Publisher | ErrorReply }>(
    "/publishers/:id",
    { schema: updatePublisherSchema },
    async (request, reply) => {
      try {
        const updatedPublisher = await service.update(request.params.id, request.body);
        return reply.send(updatedPublisher);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return notFound(reply);
        } else if (error instanceof AlreadyExistsError) {
          return conflict(reply, error.message);
        }
        throw error; // Re-throw unexpected errors
      }
    }
  );

  fastify.delete<{ Params: IdParam; Reply: null | ErrorReply }>(
    "/publishers/:id",
    { schema: deletePublisherSchema },
    async (request, reply) => {
      try {
        const deleted = await service.delete(request.params.id);
        if (!deleted) {
          return "{ message: 'Delete publisher unknow error' }"
        }
        return reply.status(204).send();
      } catch (error) {
        if (error instanceof NotFoundError) {
          return notFound(reply);
        } else if (error instanceof RelatedEntityError) {
          return conflict(reply, error.message);
        }
        throw error; // Re-throw unexpected errors
      }
    }
  );
}
