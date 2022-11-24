import { useCallback, useState } from 'react';
import { isFunction } from '../utils';

export type SetState<S extends Record<string, any>> = <K extends keyof S>(
  state: Pick<S, K> | null | ((prevState: Readonly<S>) => Pick<S, K> | S | null),
) => void;
/**
 * hooks都是不可变数据 因此经常需要解构覆盖值 使用该hook 直接传入不变的即可
 * @param initialState
 * @returns
 */
const useSetState = <S extends Record<string, any>>(
  initialState: S | (() => S),
): [S, SetState<S>] => {
  const [state, setState] = useState<S>(initialState);

  const setMergeState = useCallback((patch) => {
    setState((prevState) => {
      const newState = isFunction(patch) ? patch(prevState) : patch;
      // 内部合并状态 也是浅合并
      return newState ? { ...prevState, ...newState } : prevState;
    });
  }, []);

  return [state, setMergeState];
};

export default useSetState;
