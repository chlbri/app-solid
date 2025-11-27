export type Asyncify_F = <T extends (...args: any[]) => any>(
  fn: T,
) => (...funcArgs: Parameters<T>) => Promise<ReturnType<T>>;

export const asyncify: Asyncify_F = fn => {
  return async (...args) => fn(...args);
};
