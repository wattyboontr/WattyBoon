// Firebase has been completely removed in favor of the Cloudflare Engine.
// This module provides safe no-op stubs to prevent any dangling import runtime errors.

export enum OperationType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  LIST = 'list',
  AUTH = 'auth',
}

export const handleFirestoreError = (_error: any, _operation: OperationType, _path: string) => {
  // No-op: Firebase completely disabled, using Cloudflare persistent storage
};

export const db = null as any;
export const auth = null as any;
export const googleProvider = null as any;
