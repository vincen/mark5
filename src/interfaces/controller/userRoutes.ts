import { UserService } from '@application/services/userService';
import { Gender } from '@domain/models/account/user';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';


export async function userRoutes(app: FastifyInstance) {
  const service = new UserService();

  app.post('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      name: string;
      email: string;
      birthdate: string;
      gender: Gender;
      height: number;
      status: boolean;
    };
    const created = await service.create({
      name: body.name,
      email: body.email,
      birthdate: new Date(body.birthdate),
      gender: body.gender,
      height: body.height,
      status: body.status,
    });
    reply.code(201).send(created);
  });

  app.get('/users/:pkid', async (request: FastifyRequest, reply: FastifyReply) => {
    const { pkid } = request.params as { pkid: string };
    const user = await service.findByPkid(Number(pkid));
    if (!user) return reply.code(404).send({ error: 'User not found' });
    return reply.send(user);
  });

  app.get('/users', async (_request, reply) => {
    const list = await service.list();
    reply.send(list);
  });

  app.put('/users/:pkid', async (request: FastifyRequest, reply: FastifyReply) => {
    const { pkid } = request.params as { pkid: string };
    const data = request.body as Partial<{
      name: string;
      email: string;
      birthdate: string;
      gender: Gender;
      height: number;
      status: boolean;
    }>;
    const updated = await service.update(Number(pkid), {
      ...data,
      birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
    });
    if (!updated) return reply.code(404).send({ error: 'User not found' });
    reply.send(updated);
  });

  app.delete('/users/:pkid', async (request: FastifyRequest, reply: FastifyReply) => {
    const { pkid } = request.params as { pkid: string };
    await service.delete(Number(pkid));
    reply.code(204).send();
  });
}