import { useCallback, useState } from 'react';

/**
 * 强制当前组件渲染
 * @returns
 */
const useUpdate = () => {
  const [, setState] = useState({});

  return useCallback(() => setState({}), []);
};

export default useUpdate;
