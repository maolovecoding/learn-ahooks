import { useCallback, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import useUnmountedRef from '../useUnmountedRef';

function useSafeState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];

function useSafeState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
/**
 * 组件卸载后不在更新state的hook
 * @param initialState
 * @returns
 */
function useSafeState<S>(initialState?: S | (() => S)) {
  // 监听组件是否卸载了
  const unmountedRef = useUnmountedRef();
  const [state, setState] = useState(initialState);
  const setCurrentState = useCallback((currentState) => {
    // 当前组件卸载了  没必要更新state了
    /** if component is unmounted, stop update */
    if (unmountedRef.current) return;
    setState(currentState);
  }, []);

  return [state, setCurrentState] as const;
}

export default useSafeState;
