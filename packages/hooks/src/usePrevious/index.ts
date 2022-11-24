import { useRef } from 'react';

export type ShouldUpdateFunc<T> = (prev: T | undefined, next: T) => boolean;

const defaultShouldUpdate = <T>(a?: T, b?: T) => !Object.is(a, b);
/**
 * 保存上一次状态的hook
 * @param state 状态
 * @param shouldUpdate 是否需要更新
 * @returns
 */
function usePrevious<T>(
  state: T,
  shouldUpdate: ShouldUpdateFunc<T> = defaultShouldUpdate,
): T | undefined {
  // 上次的状态
  const prevRef = useRef<T>();
  const curRef = useRef<T>();
  // 自定义是否更新上次的状态
  if (shouldUpdate(curRef.current, state)) {
    prevRef.current = curRef.current;
    curRef.current = state;
  }
  // 返回上次的状态
  return prevRef.current;
}

export default usePrevious;
