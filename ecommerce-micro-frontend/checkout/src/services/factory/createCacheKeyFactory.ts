/**
 * Create cache key with scope
 */
export function createCacheKeyWithScope(scope: string) {
  return function (keys: unknown[]): unknown[] {
    return [scope, ...keys];
  };
}

/**
 * Create cache section with create method
 */
export function createCacheSection<TInput = void>(
  fn: (input?: TInput) => unknown[]
) {
  return {
    create: (input?: TInput) => fn(input),
  };
}

