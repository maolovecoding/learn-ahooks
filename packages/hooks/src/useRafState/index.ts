import { useCallback, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import useUnmount from '../useUnmount';

function useRafState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
function useRafState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
/**
 * 在 raf的时候执行setState
 * @param initialState
 * @returns
 */
function useRafState<S>(initialState?: S | (() => S)) {
  const ref = useRef(0);
  const [state, setState] = useState(initialState);

  const setRafState = useCallback((value: S | ((prevState: S) => S)) => {
    // 取消上次没有执行的回调
    cancelAnimationFrame(ref.current);

    ref.current = requestAnimationFrame(() => {
      // 更新value
      setState(value);
    });
  }, []);
  // 组件卸载时 取消执行 避免内存泄漏
  useUnmount(() => {
    cancelAnimationFrame(ref.current);
  });

  return [state, setRafState] as const;
}

export default useRafState;
