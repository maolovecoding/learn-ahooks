import { useRef } from 'react';
import useUpdateEffect from '../../../useUpdateEffect';
import type { Plugin, Timeout } from '../types';
import isDocumentVisible from '../utils/isDocumentVisible';
import subscribeReVisible from '../utils/subscribeReVisible';
/**
 * 通过设置 options.pollingInterval，进入轮询模式，useRequest 会定时触发 service 执行。
 * @param fetchInstance
 * @param param1
 * @returns
 */
const usePollingPlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    pollingInterval, // 轮询间隔
    pollingWhenHidden = true, // 在页面隐藏时，是否继续轮询。如果设置为 false，在页面隐藏时会暂时停止轮询，页面重新显示时继续上次轮询。
    pollingErrorRetryCount = -1, // 出现错误 最多的轮询次数
  },
) => {
  const timerRef = useRef<Timeout>();
  const unsubscribeRef = useRef<() => void>();
  // 当前已轮询的次数
  const countRef = useRef<number>(0);
  // 停止轮训
  const stopPolling = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // 取消在页面隐藏时的订阅函数
    unsubscribeRef.current?.();
  };

  useUpdateEffect(() => {
    if (!pollingInterval) {
      stopPolling();
    }
  }, [pollingInterval]);

  if (!pollingInterval) {
    return {};
  }

  return {
    onBefore: () => {
      stopPolling();
    },
    onError: () => {
      // 出现错误轮询次数加一
      countRef.current += 1;
    },
    onSuccess: () => {
      // 请求成功 重置轮询次数
      countRef.current = 0;
    },
    onFinally: () => {
      if (
        // -1 可以一直轮询
        pollingErrorRetryCount === -1 ||
        // When an error occurs, the request is not repeated after pollingErrorRetryCount retries
        // 当发生错误时，请求不会在pollingErrorRetryCount重试后重复
        // pollingErrorRetryCount !== -1 有限的错误轮询次数
        (pollingErrorRetryCount !== -1 && countRef.current <= pollingErrorRetryCount)
      ) {
        timerRef.current = setTimeout(() => {
          // if pollingWhenHidden = false && document is hidden, then stop polling and subscribe revisible
          // 页面隐藏 停止轮询 !false && !hidden(false)
          if (!pollingWhenHidden && !isDocumentVisible()) {
            unsubscribeRef.current = subscribeReVisible(() => {
              // 用上次的参数 再次开始轮询 run
              fetchInstance.refresh();
            });
          } else {
            // 开始轮询
            fetchInstance.refresh();
          }
        }, pollingInterval);
      } else {
        // 轮询结束（不轮询） 则设置轮询次数为0
        countRef.current = 0;
      }
    },
    onCancel: () => {
      stopPolling();
    },
  };
};

export default usePollingPlugin;
