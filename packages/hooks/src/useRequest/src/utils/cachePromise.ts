type CachedKey = string | number;
/**
 * 缓存promise
 */
const cachePromise = new Map<CachedKey, Promise<any>>();
/**
 * 获取缓存的promise
 * @param cacheKey
 * @returns
 */
const getCachePromise = (cacheKey: CachedKey) => {
  return cachePromise.get(cacheKey);
};
/**
 * 缓存promise
 * @param cacheKey
 * @param promise
 */
const setCachePromise = (cacheKey: CachedKey, promise: Promise<any>) => {
  // 需要缓存相同的promise 如果使用finally 会改变promise的引用
  // Should cache the same promise, cannot be promise.finally
  // Because the promise.finally will change the reference of the promise
  cachePromise.set(cacheKey, promise);

  // no use promise.finally for compatibility
  promise
    .then((res) => {
      cachePromise.delete(cacheKey);
      return res;
    })
    .catch(() => {
      cachePromise.delete(cacheKey);
    });
};

export { getCachePromise, setCachePromise };
