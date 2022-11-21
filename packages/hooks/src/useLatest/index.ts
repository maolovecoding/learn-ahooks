import { useRef } from 'react';

/**
 * 解决闭包问题 返回最新的值
 * @param value
 * @returns
 */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

export default useLatest;
