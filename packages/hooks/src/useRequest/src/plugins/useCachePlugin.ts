import { useRef } from 'react';
import useCreation from '../../../useCreation';
import useUnmount from '../../../useUnmount';
import type { Plugin } from '../types';
import * as cache from '../utils/cache';
import type { CachedData } from '../utils/cache';
import * as cachePromise from '../utils/cachePromise';
import * as cacheSubscribe from '../utils/cacheSubscribe';

const useCachePlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    cacheKey, // 有了catchKey 表示启用缓存
    cacheTime = 5 * 60 * 1000, // 设置缓存数据回收时间。默认缓存数据 5 分钟后回收
    staleTime = 0, // 缓存数据保持新鲜时间。在该时间间隔内，认为数据是新鲜的，不会重新发请求
    setCache: customSetCache,
    getCache: customGetCache,
  },
) => {
  const unSubscribeRef = useRef<() => void>();
  // 当前请求
  const currentPromiseRef = useRef<Promise<any>>();

  const _setCache = (key: string, cachedData: CachedData) => {
    // 自定义更新
    if (customSetCache) {
      customSetCache(cachedData);
    } else {
      cache.setCache(key, cacheTime, cachedData);
    }
    // 触发更新
    // 触发 key 的所有事件。假如 key 相同，就可以共享缓存的数据。
    cacheSubscribe.trigger(key, cachedData.data);
  };

  const _getCache = (key: string, params: any[] = []) => {
    // 自定义获取
    if (customGetCache) {
      return customGetCache(params);
    }
    return cache.getCache(key);
  };

  useCreation(() => {
    if (!cacheKey) {
      return;
    }

    // get data from cache when init
    const cacheData = _getCache(cacheKey);
    // (cacheData as Object).hasOwnProperty('data')
    if (cacheData && Object.hasOwnProperty.call(cacheData, 'data')) {
      // 先用缓存的返回值data和请求参数params
      fetchInstance.state.data = cacheData.data;
      fetchInstance.state.params = cacheData.params;
      // 数据新鲜度，新鲜则不需要发起请求 -1表示永远新鲜
      if (staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime) {
        fetchInstance.state.loading = false;
      }
    }

    // subscribe same cachekey update, trigger update
    // 订阅 缓存key的更新 如果更新了 则同步更新所有订阅该key的请求实例
    // 订阅同一个 cacheKey 的更新。假如两个都是用的同一个 cacheKey，那么它们的内容是可以全局同享的。
    unSubscribeRef.current = cacheSubscribe.subscribe(cacheKey, (data) => {
      fetchInstance.setState({ data });
    });
  }, []);

  useUnmount(() => {
    // 卸载取消订阅
    unSubscribeRef.current?.();
  });

  if (!cacheKey) {
    return {};
  }

  return {
    onBefore: (params) => {
      const cacheData = _getCache(cacheKey, params);
      // 没有缓存

      if (!cacheData || !Object.hasOwnProperty.call(cacheData, 'data')) {
        return {};
      }

      // If the data is fresh, stop request
      // 数据是新鲜的 不需要发起请求 走缓存就行
      if (staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime) {
        return {
          loading: false,
          data: cacheData?.data,
          error: undefined,
          returnNow: true, // 立刻缓存 指的是缓存策略
        };
      } else {
        // If the data is stale, return data, and request continue
        // 数据不是新鲜的 先用老数据渲染页面，后台请求新数据
        return {
          data: cacheData?.data,
          error: undefined,
        };
      }
    },
    // 在请求阶段，最主要做的一件事就是缓存 promise。保证同一时间点，采用了同一个 cacheKey 的请求只有一个请求被发起。
    onRequest: (service, args) => {
      // 根据 cacheKey 找是不是有缓存
      // 看 promise 有没有缓存
      // 假如 promise 已经执行完成，则为 undefined。也就是没有同样 cacheKey 在执行。
      let servicePromise = cachePromise.getCachePromise(cacheKey);

      // If has servicePromise, and is not trigger by self, then use it
      // 如果有servicePromise，并且不是自己触发的（多个请求相同的key复用同一个promise），那么就使用它
      if (servicePromise && servicePromise !== currentPromiseRef.current) {
        return { servicePromise };
      }
      // 执行本次请求
      servicePromise = service(...args);
      currentPromiseRef.current = servicePromise;
      // 设置 promise 缓存
      cachePromise.setCachePromise(cacheKey, servicePromise);
      return { servicePromise };
    },
    // 请求成功 取消订阅 重新设置缓存值 再次订阅
    onSuccess: (data, params) => {
      if (cacheKey) {
        // cancel subscribe, avoid trgger self
        unSubscribeRef.current?.();
        _setCache(cacheKey, {
          data,
          params,
          time: new Date().getTime(),
        });
        // resubscribe
        unSubscribeRef.current = cacheSubscribe.subscribe(cacheKey, (d) => {
          fetchInstance.setState({ data: d });
        });
      }
    },
    // 请求成功 取消订阅 重新设置缓存值 再次订阅
    onMutate: (data) => {
      if (cacheKey) {
        // cancel subscribe, avoid trigger self
        unSubscribeRef.current?.();
        _setCache(cacheKey, {
          data,
          params: fetchInstance.state.params,
          time: new Date().getTime(),
        });
        // resubscribe
        unSubscribeRef.current = cacheSubscribe.subscribe(cacheKey, (d) => {
          fetchInstance.setState({ data: d });
        });
      }
    },
  };
};

export default useCachePlugin;
