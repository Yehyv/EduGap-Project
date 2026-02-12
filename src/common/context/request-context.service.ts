import { AsyncLocalStorage } from 'async_hooks';

interface Store {
  userId?: number;
}

export const asyncLocalStorage = new AsyncLocalStorage<Store>();
