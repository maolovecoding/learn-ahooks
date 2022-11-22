import { useRef } from 'react';
import type { useEffect, useLayoutEffect } from 'react';

type EffectHookType = typeof useEffect | typeof useLayoutEffect;
/**
 *
 * @param hook 是useEffect 或者useLayoutEffect
 * @returns
 */
export const createUpdateEffect: (hook: EffectHookType) => EffectHookType =
  (hook) => (effect, deps) => {
    // 组件是否挂载
    const isMounted = useRef(false);

    // for react-refresh
    hook(() => {
      // 刷新 组件卸载掉了
      return () => {
        isMounted.current = false;
      };
    }, []);

    hook(() => {
      // 组件挂载
      if (!isMounted.current) {
        isMounted.current = true;
      } else {
        // deps发生更新时执行副作用函数
        return effect();
      }
    }, deps);
  };

export default createUpdateEffect;
