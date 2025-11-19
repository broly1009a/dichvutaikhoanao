import mongoose from 'mongoose';

// Import all models to ensure they're registered
import './models';

// Skip initialization during build
const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && process.env.__VERCEL_BUILD_RUNNING === 'true';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI && !isBuild) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  // Skip database connection during build time
  if (isBuild) {
    console.log('Skipping database connection during build');
    return null;
  }

  if (!MONGODB_URI) {
    console.error('MONGODB_URI not defined');
    return null;
  }

  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      return null;
    });
  }
  try {
    cached.conn = await cached.promise;
    (global as any).mongoose = cached;
    return cached.conn;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return null;
  }
}
