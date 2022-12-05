import type { DebouncedFunc, ThrottleSettings } from 'lodash';
import throttle from 'lodash/throttle';
import { useEffect, useRef } from 'react';
import type { Plugin } from '../types';

const useThrottlePlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    throttleWait, // 节流等待时间, 单位为毫秒，设置后，进入节流模式
    throttleLeading, // 在节流开始前执行调用
    throttleTrailing, // 在节流结束后执行调用
  },
) => {
  // 节流的函数
  const throttledRef = useRef<DebouncedFunc<any>>();

  const options: ThrottleSettings = {};
  if (throttleLeading !== undefined) {
    options.leading = throttleLeading;
  }
  if (throttleTrailing !== undefined) {
    options.trailing = throttleTrailing;
  }

  useEffect(() => {
    if (throttleWait) {
      // 原函数
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);
      // 创建节流函数，该函数提供一个 cancel 方法取消延迟的函数调用以及 flush 方法立即调用。
      throttledRef.current = throttle(
        (callback) => {
          callback();
        },
        throttleWait,
        options,
      );

      // throttle runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          throttledRef.current?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        // 将重写的函数还原
        fetchInstance.runAsync = _originRunAsync;
        throttledRef.current?.cancel();
      };
    }
  }, [throttleWait, throttleLeading, throttleTrailing]);

  if (!throttleWait) {
    return {};
  }

  return {
    onCancel: () => {
      throttledRef.current?.cancel();
    },
  };
};

export default useThrottlePlugin;
