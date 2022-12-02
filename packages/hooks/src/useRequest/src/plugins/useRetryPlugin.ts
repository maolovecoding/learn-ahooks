import { useRef } from 'react';
import type { Plugin, Timeout } from '../types';
/**
 * 错误重试
 * @param fetchInstance
 * @param param1
 * @returns
 */
const useRetryPlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    retryInterval, //重试时间间隔，单位为毫秒。
    //如果不设置，默认采用简易的指数退避算法，取 1000 * 2 ** retryCount，也就是第一次重试等待 2s，第二次重试等待 4s，以此类推，如果大于 30s，则取 30s
    retryCount, // 重试次数
  },
) => {
  const timerRef = useRef<Timeout>();
  const countRef = useRef(0);
  // 是否错误重试过
  const triggerByRetry = useRef(false);

  if (!retryCount) {
    return {};
  }

  return {
    onBefore: () => {
      // 没有请求重试过 重置为0
      if (!triggerByRetry.current) {
        countRef.current = 0;
      }
      triggerByRetry.current = false;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    onSuccess: () => {
      countRef.current = 0;
    },
    onError: () => {
      countRef.current += 1;
      // 重试的次数小于设置的次数
      // 或者如果 retryCount 设置为 -1，则无限次重试
      if (retryCount === -1 || countRef.current <= retryCount) {
        // Exponential backoff
        // 重试时间间隔
        const timeout = retryInterval ?? Math.min(1000 * 2 ** countRef.current, 30000);
        timerRef.current = setTimeout(() => {
          // 失败的时候置为 true，保证重试次数不重置
          triggerByRetry.current = true;
          // 用上次请求的参数 在run一次
          fetchInstance.refresh();
        }, timeout);
      } else {
        // 重试成功 重试次数设置为0
        countRef.current = 0;
      }
    },
    onCancel: () => {
      // 重置
      countRef.current = 0;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
  };
};

export default useRetryPlugin;
