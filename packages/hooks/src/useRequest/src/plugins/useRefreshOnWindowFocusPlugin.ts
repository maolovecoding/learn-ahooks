import { useEffect, useRef } from 'react';
import useUnmount from '../../../useUnmount';
import type { Plugin } from '../types';
import limit from '../utils/limit';
import subscribeFocus from '../utils/subscribeFocus';
/**
 * 通过设置 options.refreshOnWindowFocus，在浏览器窗口 refocus 和 revisible 时，会重新发起请求。其中 focusTimespan 设置重新请求间隔，单位为毫秒。
 * @param fetchInstance
 * @param param1
 * @returns
 */
const useRefreshOnWindowFocusPlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    refreshOnWindowFocus, // 是true 则在屏幕重新获取焦点或重新显示时，重新发起请求
    focusTimespan = 5000, // 和上次请求的间隔
  },
) => {
  const unsubscribeRef = useRef<() => void>();
  // 停止事件
  const stopSubscribe = () => {
    unsubscribeRef.current?.();
  };

  useEffect(() => {
    // 只有为 true 的时候，这个功能才生效
    if (refreshOnWindowFocus) {
      // 根据 focusTimespan，判断是否进行请求  limit利用闭包实现的简易节流
      const limitRefresh = limit(fetchInstance.refresh.bind(fetchInstance), focusTimespan);
      // 订阅事件
      unsubscribeRef.current = subscribeFocus(() => {
        limitRefresh();
      });
    }
    return () => {
      stopSubscribe();
    };
  }, [refreshOnWindowFocus, focusTimespan]);

  useUnmount(() => {
    stopSubscribe();
  });

  return {};
};

export default useRefreshOnWindowFocusPlugin;
