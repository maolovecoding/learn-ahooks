import { useRef } from 'react';
import useUpdateEffect from '../../../useUpdateEffect';
import type { Plugin } from '../types';
/**
 * useRequest 提供了一个 options.ready 参数，当其值为 false 时，请求永远都不会发出。
 * 当 manual=false 自动请求模式时，每次 ready 从 false 变为 true 时，都会自动发起请求， 会带上参数 options.defaultParams。
  当 manual=true 手动请求模式时，只要 ready=false，则通过 run/runAsync 触发的请求都不会执行。
 * @param fetchInstance
 * @param param1
 * @returns
 */
// support refreshDeps & ready
const useAutoRunPlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    manual, // manual 手动的 为true 则需要手动调用run/runAsync
    ready = true, // 是否ready false不会发起请求
    defaultParams = [], // 默认参数
    refreshDeps = [], // deps
    refreshDepsAction,
  },
) => {
  const hasAutoRun = useRef(false);
  hasAutoRun.current = false; // 是否正在 run中

  useUpdateEffect(() => {
    // 当 manual=false 自动请求模式时，每次 ready 从 false 变为 true 时，都会自动发起请求， 会带上参数 options.defaultParams。
    if (!manual && ready) {
      hasAutoRun.current = true;
      fetchInstance.run(...defaultParams);
    }
  }, [ready]); // ready 的变化执行

  useUpdateEffect(() => {
    if (hasAutoRun.current) {
      return;
    }
    // 自动
    if (!manual) {
      hasAutoRun.current = true;
      // 这个参数只有在内部会用到，外部 API 中暂时没有提及，感觉可以暴露
      // 依赖变化的时候的处理逻辑，假如有传的话，就执行该逻辑，否则请求请求
      if (refreshDepsAction) {
        refreshDepsAction();
      } else {
        // 采用上次的参数进行执行
        fetchInstance.refresh();
      }
    }
  }, [...refreshDeps]); // useRequest 提供了一个 options.refreshDeps 参数，当它的值变化后，会重新触发请求。

  return {
    onBefore: () => {
      // ready为false 不会发起请求
      if (!ready) {
        return {
          stopNow: true,
        };
      }
    },
  };
};

// useAutoRunPlugin 插件挂载一个初始化方法
useAutoRunPlugin.onInit = ({ ready = true, manual }) => {
  return {
    loading: !manual && ready, // 自动请求 且ready了 请求中
  };
};

export default useAutoRunPlugin;
