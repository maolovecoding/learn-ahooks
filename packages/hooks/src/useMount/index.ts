import { useEffect } from 'react';
import { isFunction } from '../utils';
import isDev from '../utils/isDev';
/**
 * 因为依赖数组时空 所以只会在初始化阶段（挂载时）执行
 * @param fn
 */
const useMount = (fn: () => void) => {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(
        `useMount: parameter \`fn\` expected to be a function, but got "${typeof fn}".`,
      );
    }
  }

  useEffect(() => {
    fn?.();
  }, []);
};

export default useMount;
