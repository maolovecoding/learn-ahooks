import { useRef } from 'react';
import useCreation from '../useCreation';
import useUpdate from '../useUpdate';
import { isObject } from '../utils';

// k:v 原对象:代理过的对象
const proxyMap = new WeakMap();
// k:v 代理过的对象:原对象
const rawMap = new WeakMap();
/**
 * 代理
 * @param initialVal
 * @param cb
 * @returns
 */
function observer<T extends Record<string, any>>(initialVal: T, cb: () => void): T {
  const existingProxy = proxyMap.get(initialVal);

  // 添加缓存 防止重新构建proxy
  if (existingProxy) {
    return existingProxy;
  }

  // 防止代理已经代理过的对象
  // https://github.com/alibaba/hooks/issues/839
  if (rawMap.has(initialVal)) {
    return initialVal;
  }

  const proxy = new Proxy<T>(initialVal, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      return isObject(res) ? observer(res, cb) : res;
    },
    set(target, key, val) {
      const ret = Reflect.set(target, key, val);
      // 强制刷新
      cb();
      return ret;
    },
    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key);
      cb();
      return ret;
    },
  });

  proxyMap.set(initialVal, proxy);
  rawMap.set(proxy, initialVal);

  return proxy;
}
/**
 * 响应式的hook
 * @param initialState
 * @returns
 */
function useReactive<S extends Record<string, any>>(initialState: S): S {
  const update = useUpdate();
  // state最新的值
  const stateRef = useRef<S>(initialState);

  const state = useCreation(() => {
    return observer(stateRef.current, () => {
      // 强制刷新组件
      update();
    });
  }, []);
  // 不需要改变 state的引用 组件也是会一直更新的
  return state;
}

export default useReactive;
