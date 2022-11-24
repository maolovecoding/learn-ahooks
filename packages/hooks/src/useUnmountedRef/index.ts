import { useEffect, useRef } from 'react';

/**
 *
 * @returns 返回一个ref 通过ref可以知道组件是否卸载了
 */
const useUnmountedRef = () => {
  const unmountedRef = useRef(false);
  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);
  return unmountedRef;
};

export default useUnmountedRef;
