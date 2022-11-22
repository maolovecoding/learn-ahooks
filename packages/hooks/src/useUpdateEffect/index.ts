import { useEffect } from 'react';
import { createUpdateEffect } from '../createUpdateEffect';

/**
 * 副作用只会在组件更新时触发
 */
export default createUpdateEffect(useEffect);
