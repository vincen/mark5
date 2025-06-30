export const HTTP_404_SCHEMA = {
  type: "object",
  properties: { message: { type: "string" } },
};

export type IdParam = { id: number; };
export type NotFoundReply = { message: string };
export type DuplicatedReply = { message: string };
export type ErrorReply = { message: string };

// Helper function for not found responses
export function notFound(reply: any): any {
  return reply.code(404).send({ message: "Not found" });
}

// Helper function for duplicated / related entity responses
export function conflict(reply: any, message: string): any {
  return reply.code(409).send({ message });
}