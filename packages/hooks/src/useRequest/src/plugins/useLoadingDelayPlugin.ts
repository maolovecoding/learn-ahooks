import { useRef } from 'react';
import type { Plugin, Timeout } from '../types';
/**
 * 通过设置 options.loadingDelay ，可以延迟 loading 变成 true 的时间，有效防止闪烁。
 * @param fetchInstance
 * @param param1
 * @returns
 */
const useLoadingDelayPlugin: Plugin<any, any[]> = (fetchInstance, { loadingDelay }) => {
  const timerRef = useRef<Timeout>();
  // 没有传入 loadingDelay参数
  if (!loadingDelay) {
    return {};
  }

  const cancelTimeout = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return {
    onBefore: () => {
      cancelTimeout();

      timerRef.current = setTimeout(() => {
        fetchInstance.setState({
          // 通过 setTimeout 实现延迟 loading 的时间
          loading: true,
        });
      }, loadingDelay);

      return {
        loading: false,
      };
    },
    onFinally: () => {
      cancelTimeout();
    },
    onCancel: () => {
      cancelTimeout();
    },
  };
};

export default useLoadingDelayPlugin;
