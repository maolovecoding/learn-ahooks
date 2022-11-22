import type { DependencyList } from 'react';
import { useEffect } from 'react';
import { isFunction } from '../utils';
/**
 *
 * @param effect 支持异步的effect
 * @param deps
 */
function useAsyncEffect(
  effect: () => AsyncGenerator<void, void, void> | Promise<void>,
  deps?: DependencyList,
) {
  function isAsyncGenerator(
    val: AsyncGenerator<void, void, void> | Promise<void>,
  ): val is AsyncGenerator<void, void, void> {
    return isFunction(val[Symbol.asyncIterator]);
  }
  useEffect(() => {
    // async fn  或者 async generator
    const e = effect();
    // 副作用过时了
    let cancelled = false;
    async function execute() {
      // 异步迭代器
      if (isAsyncGenerator(e)) {
        while (true) {
          const result = await e.next();
          // 是最后一个数据 或者
          if (result.done || cancelled) {
            break;
          }
        }
      } else {
        // promise
        await e;
      }
    }
    execute();
    return () => {
      // 卸载时 不在执行
      cancelled = true;
    };
  }, deps);
}

export default useAsyncEffect;
