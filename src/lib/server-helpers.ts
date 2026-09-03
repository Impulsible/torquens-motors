/**
 * Check if code is running on the server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if code is running on the client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Ensure code only runs on the server
 * Throws an error if called on the client
 */
export function requireServer(): void {
  if (isClient()) {
    throw new Error('This function can only be called on the server');
  }
}

/**
 * Ensure code only runs on the client
 * Throws an error if called on the server
 */
export function requireClient(): void {
  if (isServer()) {
    throw new Error('This function can only be called on the client');
  }
}

/**
 * Safely execute a function only on the server
 */
export function onServer<T>(fn: () => T): T | undefined {
  if (isServer()) {
    return fn();
  }
  return undefined;
}

/**
 * Safely execute a function only on the client
 */
export function onClient<T>(fn: () => T): T | undefined {
  if (isClient()) {
    return fn();
  }
  return undefined;
}

/**
 * Get environment variable safely (only on server)
 */
export function getServerEnv(key: string): string | undefined {
  if (isServer()) {
    return process.env[key];
  }
  return undefined;
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback?: string): string | undefined {
  const value = getServerEnv(key);
  return value ?? fallback;
}