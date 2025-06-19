// src/interfaces/controller/userRoutes.ts
import { UserDto } from '@application/dto/userDto'
import { UserServiceV2 } from '@application/services/userServiceV2'
import { Gender, User } from '@domain/models/account/user'
import { CreateUserForm, UpdateUserForm } from '@interfaces/form/userForm'
import { FastifyInstance, FastifySchema } from 'fastify'

// Schema definitions
const genderEnum = Object.values(Gender)

const userBaseProperties = {
  name: { type: 'string', minLength: 1, maxLength: 100 },
  email: { type: 'string', format: 'email' },
  birthdate: { type: 'string', format: 'date' },
  gender: { type: 'string', enum: genderEnum },
  height: { type: 'number', minimum: 50, maximum: 250 },
  status: { type: 'boolean' },
}

// GET /users
const listUsersSchema: FastifySchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pkid: { type: 'integer' },
          ...userBaseProperties,
        },
        required: ['pkid', ...Object.keys(userBaseProperties)],
      },
    },
  },
}

// GET /users/:id
const getUserSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'integer', minimum: 1 } },
    required: ['id'],
  },
  response: {
    200: {
      type: 'object',
      properties: { pkid: { type: 'integer' }, ...userBaseProperties },
      required: ['pkid', ...Object.keys(userBaseProperties)],
    },
    404: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}

// POST /users
const createUserSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: { ...userBaseProperties },
    required: ['name', 'email', 'birthdate', 'gender', 'height', 'status'],
    additionalProperties: false,
  },
  response: {
    201: {
      type: 'object',
      properties: { pkid: { type: 'integer' }, ...userBaseProperties },
      required: ['pkid', ...Object.keys(userBaseProperties)],
    },
  },
}

// PUT /users/:id
const updateUserSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'integer', minimum: 1 } },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: { ...userBaseProperties },
    additionalProperties: false,
    minProperties: 1,
  },
  response: {
    200: {
      type: 'object',
      properties: { pkid: { type: 'integer' }, ...userBaseProperties },
      required: ['pkid', ...Object.keys(userBaseProperties)],
    },
    404: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}

// DELETE /users/:id
const deleteUserSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'integer', minimum: 1 } },
    required: ['id'],
  },
  response: {
    204: { type: 'null' },
    404: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}

export default async function userRoutes(fastify: FastifyInstance) {
  const service = new UserServiceV2()

  fastify.get('/users', { schema: {listUsersSchema, tags:['users-v2']} }, async (request, reply) => {
    const users = await service.list()
    reply.send(users)
  })

  fastify.get('/users/:id', { schema: {getUserSchema, tags:['users-v2']} }, async (request, reply) => {
    const { id } = request.params as { id: number }
    const user = await service.findByPkid(id)
    if (!user) {
      return reply.code(404).send({ message: 'User not found' })
    }
    reply.send(user)
  })

  fastify.post('/users', { schema: {createUserSchema, tags:['users-v2']} }, async (request, reply) => {
    const body = request.body as CreateUserForm;
    const userDto: UserDto = {
      ...body,
      birthdate: new Date(body.birthdate), // 转换为 Date 对象
    }
    const user = await service.create(userDto);
    reply.code(201).send(user)
  })

  fastify.put('/users/:id', { schema: {updateUserSchema, tags:['users-v2']} }, async (request, reply) => {
    const { id } = request.params as { id: number }
    const body = request.body as UpdateUserForm;
    const updates: Partial<UserDto> = { ...body } as any;
    if (updates.birthdate) {
      updates.birthdate = new Date(updates.birthdate) // 转换为 Date 对象
    }
    const updated = await service.update(id, updates)
    if (!updated) {
      return reply.code(404).send({ message: 'User not found' })
    }
    reply.send(updated)
  })

  fastify.delete('/users/:id', { schema: {deleteUserSchema, tags:['users-v2']} }, async (request, reply) => {
    const { id } = request.params as { id: number }
    const success = await service.delete(id)
    if (!success) {
      return reply.code(404).send({ message: 'User not found' })
    }
    reply.code(204).send()
  })
}
