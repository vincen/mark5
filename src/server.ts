import { createApp } from "./app";

// Start the server
async function startServer() {
  const app = await createApp();
  const port = 3000;

  try {
    const address = await app.listen({ port });
    app.log.info(`Server is running on ${address}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

startServer();