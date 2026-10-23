import mongoose from 'mongoose';

/**
 * Falling back to a local MongoDB in production produced a bare
 * `ECONNREFUSED 127.0.0.1:27017` at the end of a long build on hosts with no
 * MongoDB installed, which reads as a network fault rather than a missing
 * setting. Development keeps the convenience; production must be explicit.
 */
function resolveMongoUri() {
  const uri = String(process.env.MONGODB_URI || '').trim();
  if (uri) return uri;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI is not set. Set it in .env.local before building or starting the app.');
  }

  return 'mongodb://127.0.0.1:27017/dnr-modern';
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = (global as any).mongoose as MongooseCache | undefined;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null } as MongooseCache;
}

export async function connectDB() {
  if (cached?.conn) return cached.conn;
  if (!cached?.promise) {
    cached!.promise = mongoose
      .connect(resolveMongoUri(), { bufferCommands: false })
      .then((m) => m);
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
