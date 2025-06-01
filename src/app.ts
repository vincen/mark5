import Fastify from 'fastify';
import sensible from 'fastify-sensible';

import { userRoutes } from '@interfaces/controller/userRoutes';


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

  await app.register(sensible);
  // Register routes
  await app.register(userRoutes, { prefix: '/api' });
  // Add a health check route
  // app.get('/health', async (request, reply) => {
  //   return { status: 'ok', timestamp: new Date() };
  // });
  // // Add a not found route
  // app.setNotFoundHandler((request, reply) => {
  //   reply.status(404).send({ error: 'Not Found' });
  // });
  // // Add a method to handle uncaught exceptions
  // app.setUncaughtExceptionHandler((error, request, reply) => {
  //   request.log.error(error);
  //   reply.status(500).send({ error: 'Internal Server Error' });
  // });
  // // Add a method to handle uncaught promise rejections
  // app.setUncaughtPromiseErrorHandler((error, request, reply) => {
  //   request.log.error(error);
  //   reply.status(500).send({ error: 'Internal Server Error' });
  // });
  // // Add a method to handle request validation errors
  // app.setValidatorCompiler(({ schema }) => {
  //   return (data) => {
  //     const validate = app.ajv.compile(schema);
  //     const valid = validate(data);
  //     if (!valid) {
  //       const errors = validate.errors.map((err) => ({
  //         message: err.message,

  // // Error handling
  // app.setErrorHandler((error, request, reply) => {
  //   request.log.error(error);
  //   reply.status(500).send({ error: 'Internal Server Error' });
  // });

  return app;
}
