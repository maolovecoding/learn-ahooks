import { useState } from 'react';
import useMemoizedFn from '../useMemoizedFn';
/**
 * 和map类似
 * @param initialValue
 * @returns
 */
function useMap<K, T>(initialValue?: Iterable<readonly [K, T]>) {
  const getInitValue = () => {
    return initialValue === undefined ? new Map() : new Map(initialValue);
  };

  const [map, setMap] = useState<Map<K, T>>(() => getInitValue());
  // 设置单个key value
  const set = (key: K, entry: T) => {
    setMap((prev) => {
      const temp = new Map(prev);
      temp.set(key, entry);
      return temp;
    });
  };
  // 替换为一个新的map
  const setAll = (newMap: Iterable<readonly [K, T]>) => {
    setMap(new Map(newMap));
  };
  // 移除
  const remove = (key: K) => {
    setMap((prev) => {
      const temp = new Map(prev);
      temp.delete(key);
      return temp;
    });
  };
  // 重置
  const reset = () => setMap(getInitValue());
  // TODO 其实获取这个函数只是为了方便吧 ，因为get本身是没有副作用的
  const get = (key: K) => map.get(key);
  return [
    map,
    {
      set: useMemoizedFn(set),
      setAll: useMemoizedFn(setAll),
      remove: useMemoizedFn(remove),
      reset: useMemoizedFn(reset),
      get: useMemoizedFn(get),
    },
  ] as const;
}

export default useMap;
