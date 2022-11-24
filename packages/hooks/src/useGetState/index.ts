import type { Dispatch, SetStateAction } from 'react';
import { useState, useRef, useCallback } from 'react';

type GetStateAction<S> = () => S;

/**
 * getter可用拿到最新的值
 * @param initialState
 */
function useGetState<S>(
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>, GetStateAction<S>];
function useGetState<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>,
  GetStateAction<S | undefined>,
];
function useGetState<S>(initialState?: S) {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  // 使用ref保存最新的值 在外面通过getter取到最新值 而且getter可用避免掉闭包陷阱
  stateRef.current = state;

  const getState = useCallback(() => stateRef.current, []);

  return [state, setState, getState];
}

export default useGetState;
