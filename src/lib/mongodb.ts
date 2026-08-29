import mongoose from 'mongoose';
import { MongoClient, MongoClientOptions } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable inside .env.local');
}

// Define connection options
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 60000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4, // Use IPv4, skip trying IPv6
};

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  client: MongoClient | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { 
  conn: null, 
  promise: null,
  client: null 
};

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB using Mongoose
 * This is the primary connection method for the application
 */
export async function connectToDatabase() {
  if (cached.conn) {
    console.log('📦 Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔗 Creating new MongoDB connection...');
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: options.maxPoolSize,
      minPoolSize: options.minPoolSize,
      maxIdleTimeMS: options.maxIdleTimeMS,
      socketTimeoutMS: options.socketTimeoutMS,
      serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
      family: options.family,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

/**
 * Get native MongoDB client for raw operations
 * Useful for complex aggregations or when Mongoose isn't suitable
 */
export async function getMongoClient() {
  if (cached.client) {
    return cached.client;
  }

  try {
    const client = new MongoClient(MONGODB_URI, options);
    await client.connect();
    cached.client = client;
    console.log('✅ MongoDB native client connected');
    return client;
  } catch (error) {
    console.error('❌ MongoDB native client connection error:', error);
    throw error;
  }
}

/**
 * Get a specific database instance
 */
export async function getDatabase(dbName?: string) {
  const client = await getMongoClient();
  const db = client.db(dbName || process.env.MONGODB_DB_NAME || 'torquens');
  return db;
}

/**
 * Disconnect from MongoDB
 * Useful for tests or when shutting down
 */
export async function disconnectFromDatabase() {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
  
  if (cached.client) {
    await cached.client.close();
    cached.client = null;
  }
  
  console.log('🔌 Disconnected from MongoDB');
}

/**
 * Check database connection health
 */
export async function checkDatabaseHealth() {
  try {
    const conn = await connectToDatabase();
    const state = conn.connection.readyState;
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    return {
      status: states[state as keyof typeof states] || 'unknown',
      ready: state === 1,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      ready: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

// Export mongoose for direct use when needed
export { mongoose };