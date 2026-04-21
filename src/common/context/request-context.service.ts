import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextStore {
  userId?: number;
  method?: string;
  route?: string;
  originalUrl?: string;
  ip?: string;
  userAgent?: string;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: unknown;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContextStore>();

export const getRequestContext = (): RequestContextStore | undefined =>
  asyncLocalStorage.getStore();
