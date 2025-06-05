import { createApp } from "@app";

// Start the server
async function startServer() {
  const app = await createApp();
  const port = 3000;
  const host = "0.0.0.0";


  try {
    await app.listen({ port: port, host: host });
    app.log.info(`Starting server on http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

startServer();