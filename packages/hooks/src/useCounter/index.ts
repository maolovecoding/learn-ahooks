import { useState } from 'react';
import useMemoizedFn from '../useMemoizedFn';
import { isNumber } from '../utils';

export interface Options {
  min?: number;
  max?: number;
}

export interface Actions {
  inc: (delta?: number) => void;
  dec: (delta?: number) => void;
  set: (value: number | ((c: number) => number)) => void;
  reset: () => void;
}

export type ValueParam = number | ((c: number) => number);

function getTargetValue(val: number, options: Options = {}) {
  // 最大值 最小值
  const { min, max } = options;
  let target = val;
  if (isNumber(max)) {
    target = Math.min(max, target);
  }
  if (isNumber(min)) {
    target = Math.max(min, target);
  }
  return target;
}

function useCounter(initialValue: number = 0, options: Options = {}) {
  // 最大值 最小值
  const { min, max } = options;
  const [current, setCurrent] = useState(() => {
    return getTargetValue(initialValue, {
      min,
      max,
    });
  });
  // 设置当前计数器的值
  const setValue = (value: ValueParam) => {
    setCurrent((c) => {
      // 设置值为 如果是函数 那就把当前的值传递这个函数
      const target = isNumber(value) ? value : value(c);
      return getTargetValue(target, {
        max,
        min,
      });
    });
  };
  // 增
  const inc = (delta: number = 1) => {
    setValue((c) => c + delta);
  };
  // 减
  const dec = (delta: number = 1) => {
    setValue((c) => c - delta);
  };
  // 设置值
  const set = (value: ValueParam) => {
    setValue(value);
  };
  // 重置
  const reset = () => {
    // 闭包 初始化的值没有释放
    setValue(initialValue);
  };

  return [
    current,
    {
      inc: useMemoizedFn(inc),
      dec: useMemoizedFn(dec),
      set: useMemoizedFn(set),
      reset: useMemoizedFn(reset),
    },
  ] as const; // 只读 as const
}

export default useCounter;
