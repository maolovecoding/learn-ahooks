import debounce from 'lodash/debounce';
import { useMemo } from 'react';
import type { DebounceOptions } from '../useDebounce/debounceOptions';
import useLatest from '../useLatest';
import useUnmount from '../useUnmount';
import { isFunction } from '../utils';
import isDev from '../utils/isDev';

type noop = (...args: any[]) => any;

/**
 * 防抖函数 hook
 * @param fn
 * @param options
 * @returns
 */
function useDebounceFn<T extends noop>(fn: T, options?: DebounceOptions) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useDebounceFn expected parameter is a function, got ${typeof fn}`);
    }
  }
  // 保存最新的fn引用
  const fnRef = useLatest(fn);
  // 等待时间（防抖间隔）
  const wait = options?.wait ?? 1000;

  const debounced = useMemo(
    () =>
      debounce(
        (...args: Parameters<T>): ReturnType<T> => {
          return fnRef.current(...args);
        },
        wait,
        options,
      ),
    [],
  );
  // 取消防抖函数的执行
  useUnmount(() => {
    debounced.cancel();
  });

  return {
    // 执行函数
    run: debounced,
    // 取消防抖函数的执行
    cancel: debounced.cancel,
    // 立刻执行
    flush: debounced.flush,
  };
}

export default useDebounceFn;
