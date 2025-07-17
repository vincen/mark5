export const HTTP_4xx_SCHEMA = {
  type: "object",
  properties: { message: { type: "string" } },
};

export const ID_PARAM_SCHEMA = {
  type: 'object',
  properties: { id: { type: 'integer', minimum: 1 } },
  required: ['id'],
  additionalProperties: false,
};

export type IdParam = { id: number; };
export type NotFoundReply = { message: string };
export type DuplicatedReply = { message: string };
export type ErrorReply = { message: string };

// Helper function for not found responses
export function notFound(reply: any, message: string = "Not found"): any {
  return badRequest(reply, message, 404);
}

// Helper function for duplicated / related entity responses
export function conflict(reply: any, message: string): any {
  return badRequest(reply, message, 409);
}

// Helper function for missing parameter responses
export function badRequest(reply: any, message: string, httpCode: number = 400, ): any {
  return reply.code(httpCode).send({ message });
}