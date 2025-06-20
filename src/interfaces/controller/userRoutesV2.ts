// src/interfaces/controller/userRoutes.ts
import { UserDto } from "@application/dto/userDto";
import { UserServiceV2 } from "@application/services/userServiceV2";
import { Gender, User } from "@domain/models/account/user";
import { CreateUserForm, UpdateUserForm } from "@interfaces/form/userForm";
import { FastifyInstance, FastifySchema } from "fastify";

const USER_TAG = "users-v2";
// Schema definitions
const genderEnum = Object.values(Gender);

const userBaseProperties = {
  name: { type: "string", minLength: 1, maxLength: 100 },
  email: { type: "string", format: "email" },
  birthdate: { type: "string", format: "date" },
  gender: { type: "string", enum: genderEnum },
  height: { type: "number", minimum: 50, maximum: 250 },
  status: { type: "boolean" },
};

const userSchema = {
  type: "object",
  properties: {
    pkid: { type: "integer" },
    ...userBaseProperties,
  },
  required: ["pkid", ...Object.keys(userBaseProperties)],
  additionalProperties: false,
};

// GET /users
const listUsersSchema: FastifySchema = {
  response: {
    200: {
      type: "array",
      items: userSchema
    },
  },
};

// GET /users/:id
const getUserSchema: FastifySchema = {
  params: {
    type: "object",
    properties: { id: { type: "integer", minimum: 1 } },
    required: ["id"],
  },
  response: {
    200: userSchema,
    404: {
      type: "object",
      properties: { message: { type: "string" } },
    },
  },
};

// POST /users
const createUserSchema: FastifySchema = {
  body: {
    type: "object",
    properties: { ...userBaseProperties },
    required: ["name", "email", "birthdate", "gender", "height", "status"],
    additionalProperties: false,
  },
  response: {
    201: userSchema,
  },
};

// PUT /users/:id
const updateUserSchema: FastifySchema = {
  params: {
    type: "object",
    properties: { id: { type: "integer", minimum: 1 } },
    required: ["id"],
  },
  body: {
    type: "object",
    properties: { ...userBaseProperties },
    additionalProperties: false,
    minProperties: 1,
  },
  response: {
    200: userSchema,
    404: {
      type: "object",
      properties: { message: { type: "string" } },
    },
  },
};

// DELETE /users/:id
const deleteUserSchema: FastifySchema = {
  params: {
    type: "object",
    properties: { id: { type: "integer", minimum: 1 } },
    required: ["id"],
  },
  response: {
    204: { type: "null" },
    404: {
      type: "object",
      properties: { message: { type: "string" } },
    },
  },
};

// Typpe aliases for request bodies
type UserIdParam = { id: number };
type NotFoundReply = { message: string };

// Helper function for not found responses
function notFound(reply: any): any {
  return reply.code(404).send({ message: "User not found" });
}

export default async function userRoutes(fastify: FastifyInstance) {
  const service = new UserServiceV2();

  fastify.get<{ Reply: User[] }>(
    "/users",
    { schema: { ...listUsersSchema, tags: [USER_TAG] } },
    async (request, reply) => {
      const users = await service.list();
      reply.send(users);
    }
  );

  fastify.get<{ Params: UserIdParam; Reply: User | NotFoundReply }>(
    "/users/:id",
    { schema: { ...getUserSchema, tags: [USER_TAG] } },
    async (request, reply) => {
      const { id } = request.params;
      const user = await service.findByPkid(id);
      if (!user) {
        return notFound(reply);
      }
      reply.send(user);
    }
  );

  fastify.post<{
    Body: CreateUserForm;
    Reply: User;
  }>("/users", { schema: { ...createUserSchema, tags: [USER_TAG] } }, async (request, reply) => {
    // const body = request.body as CreateUserForm;
    const userDto: UserDto = {
      ...request.body,
      birthdate: new Date(request.body.birthdate), // 转换为 Date 对象
    };
    const user = await service.create(userDto);
    reply.code(201).send(user);
  });

  fastify.put<{
    Params: UserIdParam;
    Body: UpdateUserForm;
    Reply: User | NotFoundReply
  }>("/users/:id", { schema: { ...updateUserSchema, tags: [USER_TAG] } }, async (request, reply) => {
    const { id } = request.params;
    const updates: Partial<UserDto> = { ...request.body } as any;
    if (updates.birthdate) {
      updates.birthdate = new Date(updates.birthdate); // 转换为 Date 对象
    }
    const updated = await service.update(id, updates);
    if (!updated) {
      return notFound(reply);
    }
    reply.send(updated);
  });

  fastify.delete<{
    Params: UserIdParam;
    Reply: null | NotFoundReply
  }>("/users/:id", { schema: { ...deleteUserSchema, tags: [USER_TAG] } }, async (request, reply) => {
    const { id } = request.params;
    const success = await service.delete(id);
    if (!success) {
      return reply.code(404).send({ message: "User not found" });
    }
    reply.code(204).send();
  });
}
