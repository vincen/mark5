import Fastify from 'fastify';
import sensible from 'fastify-sensible';
import userRoutesV2 from '@interfaces/controller/userRoutesV2';
import { userRoutes } from '@interfaces/controller/userRoutes';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

export async function createApp() {
  const app = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        coerceTypes: 'array',
        useDefaults: true,
        removeAdditional: 'all',
      },
    },
  });

  // 1. Register Swagger
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Mark5 API',
        description: 'API documentation for Mark5 application',
        version: 'V3',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'users-v1', description: 'User related endpoints' },
        { name: 'users-v2', description: 'User related endpoints for version 2' },
      ],
    }
  });

  // 2. Register Swagger UI
  await app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    // staticCSP: true,
    // transformStaticCSP: (header) => header,
    // transformSpecification: (swaggerObject, request, reply) => { return swaggerObject; },
    // transformSpecificationClone: true,
    uiHooks: {
      onRequest: (request, reply, next) => next(),
      preHandler: (request, reply, next) => next(),
    }
  });

  await app.register(sensible);
  // Register routes
  await app.register(userRoutes, { prefix: '/api/v1' });
  await app.register(userRoutesV2, { prefix: '/api/v2' });
  // Add a health check route
  app.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date() };
  });

  return app;
}
