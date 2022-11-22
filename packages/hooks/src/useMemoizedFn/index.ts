import { useMemo, useRef } from 'react';
import { isFunction } from '../utils';
import isDev from '../utils/isDev';

type noop = (this: any, ...args: any[]) => any;

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

function useMemoizedFn<T extends noop>(fn: T) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useMemoizedFn expected parameter is a function, got ${typeof fn}`);
    }
  }
  // 每次拿到最新的 fn 值，并把它更新到 fnRef 中。这可以保证此 ref 能够持有最新的 fn 引用
  // useLatest
  const fnRef = useRef<T>(fn);

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  // TODO 可以在学习一下 不是很理解 缓存一个记忆函数
  fnRef.current = useMemo(() => fn, [fn]);
  // 保证最后返回的函数引用是不变的-持久化函数
  const memoizedFn = useRef<PickFunction<T>>();
  if (!memoizedFn.current) {
    // 返回的持久化函数，调用该函数的时候，调用原始的函数
    // 每次调用的时候，因为没有 useCallback 的 deps 特性，所以都能拿到最新的 state
    memoizedFn.current = function (this, ...args) {
      // 这里会拿到最新的 fn 进行执行 而且执行时拿到的是最新的参数
      return fnRef.current.apply(this, args);
    };
  }
  // 函数的引用永远不会发生改变
  return memoizedFn.current as T;
}

export default useMemoizedFn;
