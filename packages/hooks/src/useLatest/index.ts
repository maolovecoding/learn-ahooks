import { useRef } from 'react';

/**
 * 解决闭包问题 返回最新的值 value是函数的话 每次都可以拿到最新的函数的引用  所以解决了闭包问题
 * @param value
 * @returns
 */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

export default useLatest;
