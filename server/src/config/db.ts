import mongoose from 'mongoose';
import { ENV } from './env';

let memoryServerInstance: any = null;

export async function connectDB(uri?: string): Promise<typeof mongoose> {
  const targetUri = uri || ENV.MONGODB_URI;

  try {
    // Attempt standard MongoDB connection
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (err: any) {
    console.warn(`[MongoDB] Direct connection to "${targetUri}" failed (${err.message}).`);

    if (ENV.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Starting automated local MongoDB database engine...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const path = await import('path');
        const fs = await import('fs');

        if (process.env.NODE_ENV === 'test') {
          memoryServerInstance = await MongoMemoryServer.create();
        } else {
          const dataDir = path.resolve(process.cwd(), '.mongodb_data');
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }
          memoryServerInstance = await MongoMemoryServer.create({
            instance: {
              dbPath: dataDir,
              storageEngine: 'wiredTiger',
            },
          });
        }

        const memUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[MongoDB] Connected to local persistent database at: ${memUri}`);
        return conn;
      } catch (memErr: any) {
        console.error('[MongoDB] Local database startup failed:', memErr.message);
        throw memErr;
      }
    }

    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
}
