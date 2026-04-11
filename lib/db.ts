import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dnr-modern';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
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
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
