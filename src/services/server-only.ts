import 'server-only';

// This file ensures that database imports are only used on the server
// Re-export all database functions from here
export * from './database';