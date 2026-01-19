import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

type GlobalWithMongoose = typeof globalThis & {
  mongoose?: MongooseCache;
};

// Keep a single cache instance across hot reloads in development.
const globalForMongoose = globalThis as GlobalWithMongoose;
const cached = (globalForMongoose.mongoose ??= { conn: null, promise: null });

export default async function connectToDatabase(): Promise<Mongoose> {
  // Return existing connection if it exists.
  if (cached.conn) {
    return cached.conn;
  }

  // Cache the promise to prevent creating multiple connections.
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((connection) => connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
