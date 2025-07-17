// src/interfaces/controller/userRoutes.ts
import { UserDto } from "@application/dto/userDto";
import { UserServiceV2 } from "@application/services/userServiceV2";
import { Gender, User } from "@domain/models/account/user";
import { CreateUserForm, UpdateUserForm } from "@interfaces/form/userForm";
import { HTTP_4xx_SCHEMA, ID_PARAM_SCHEMA, IdParam, notFound, NotFoundReply } from "@interfaces/shared/httpDef";
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
  tags: [USER_TAG],
  response: {
    200: {
      type: "array",
      items: userSchema,
    },
  },
};

// GET /users/:id
const getUserSchema: FastifySchema = {
  tags: [USER_TAG],
  params: ID_PARAM_SCHEMA,
  response: {
    200: userSchema,
    404: HTTP_4xx_SCHEMA,
  },
};

// POST /users
const createUserSchema: FastifySchema = {
  tags: [USER_TAG],
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
  tags: [USER_TAG],
  params: ID_PARAM_SCHEMA,
  body: {
    type: "object",
    properties: { ...userBaseProperties },
    additionalProperties: false,
    minProperties: 1,
  },
  response: {
    200: userSchema,
    404: HTTP_4xx_SCHEMA,
  },
};

// DELETE /users/:id
const deleteUserSchema: FastifySchema = {
  tags: [USER_TAG],
  params: ID_PARAM_SCHEMA,
  response: {
    204: { type: "null" },
    404: HTTP_4xx_SCHEMA,
  },
};

export default async function userRoutes(fastify: FastifyInstance) {
  const service = new UserServiceV2();

  fastify.get<{ Reply: User[] }>("/users", { schema: listUsersSchema }, async (request, reply) => {
    const users = await service.list();
    reply.send(users);
  });

  fastify.get<{ Params: IdParam; Reply: User | NotFoundReply }>(
    "/users/:id",
    { schema: getUserSchema },
    async (request, reply) => {
      const { id } = request.params;
      const user = await service.findByPkid(id);
      if (!user) {
        return notFound(reply);
      }
      reply.send(user);
    }
  );

  fastify.post<{ Body: CreateUserForm; Reply: User }>(
    "/users",
    { schema: createUserSchema },
    async (request, reply) => {
      // const body = request.body as CreateUserForm;
      const userDto: UserDto = {
        ...request.body,
        birthdate: new Date(request.body.birthdate), // 转换为 Date 对象
      };
      const user = await service.create(userDto);
      reply.code(201).send(user);
    }
  );

  fastify.put<{Params: IdParam; Body: UpdateUserForm; Reply: User | NotFoundReply; }>(
    "/users/:id", { schema: updateUserSchema }, async (request, reply) => {
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

  fastify.delete<{Params: IdParam; Reply: null | NotFoundReply; }>(
    "/users/:id", { schema: deleteUserSchema }, async (request, reply) => {
    const { id } = request.params;
    const success = await service.delete(id);
    if (!success) {
      return reply.code(404).send({ message: "User not found" });
    }
    reply.code(204).send();
  });
}
