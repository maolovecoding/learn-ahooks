type Timer = ReturnType<typeof setTimeout>;
type CachedKey = string | number;

export interface CachedData<TData = any, TParams = any> {
  data: TData;
  params: TParams;
  time: number;
}
interface RecordData extends CachedData {
  timer: Timer | undefined;
}
/**
 * 缓存 是放在内存中的
 */
const cache = new Map<CachedKey, RecordData>();
/**
 * 默认设置缓存
 * @param key
 * @param cacheTime 过期时间
 * @param cachedData 缓存数据
 */
const setCache = (key: CachedKey, cacheTime: number, cachedData: CachedData) => {
  // 这个key是否缓存过
  const currentCache = cache.get(key);
  if (currentCache?.timer) {
    // 清除定时器
    clearTimeout(currentCache.timer);
  }

  let timer: Timer | undefined = undefined;
  // -1 表示永不过期
  if (cacheTime > -1) {
    // if cache out, clear it
    timer = setTimeout(() => {
      // 过期清除
      cache.delete(key);
    }, cacheTime);
  }

  cache.set(key, {
    ...cachedData,
    timer,
  });
};
/**
 * 取缓存的值
 * @param key
 * @returns
 */
const getCache = (key: CachedKey) => {
  return cache.get(key);
};
/**
 * 清除缓存
 * @param key
 */
const clearCache = (key?: string | string[]) => {
  if (key) {
    const cacheKeys = Array.isArray(key) ? key : [key];
    cacheKeys.forEach((cacheKey) => cache.delete(cacheKey));
  } else {
    cache.clear();
  }
};

export { getCache, setCache, clearCache };
