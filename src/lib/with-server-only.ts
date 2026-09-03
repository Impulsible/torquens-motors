// This file helps ensure that database imports only happen on the server
export function isServer() {
  return typeof window === 'undefined';
}

export function requireServerOnly() {
  if (!isServer()) {
    throw new Error('This module can only be used on the server');
  }
}