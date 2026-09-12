import { app } from './app';
import { connectDB, disconnectDB } from './config/db';
import { ENV } from './config/env';
import { seedDatabase } from './seed/seed';
import { User } from './models/User';

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(ENV.PORT, () => {
      console.log(`\n🚀 Notely Backend Server running on http://localhost:${ENV.PORT}`);
      console.log(`📋 Health check: http://localhost:${ENV.PORT}/api/health\n`);
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Closing server gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Server and DB connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err: any) {
    console.error('[Server Startup Error]:', err.message);
    process.exit(1);
  }
}

startServer();
