/* eslint-disable @typescript-eslint/no-parameter-properties */
import { isFunction } from '../../utils';
import type { MutableRefObject } from 'react';
import type { FetchState, Options, PluginReturn, Service, Subscribe } from './types';

export default class Fetch<TData, TParams extends any[]> {
  // 插件 插件执行后返回的方法列表
  pluginImpls: PluginReturn<TData, TParams>[];

  count: number = 0;

  state: FetchState<TData, TParams> = {
    loading: false,
    params: undefined,
    data: undefined,
    error: undefined,
  };

  constructor(
    public serviceRef: MutableRefObject<Service<TData, TParams>>,
    public options: Options<TData, TParams>,
    public subscribe: Subscribe, // 就是强制更新函数 update
    public initState: Partial<FetchState<TData, TParams>> = {}, // 初始值
  ) {
    this.state = {
      ...this.state,
      loading: !options.manual, // 非手动，就loading
      ...initState,
    };
  }
  // 更新状态
  setState(s: Partial<FetchState<TData, TParams>> = {}) {
    this.state = {
      ...this.state,
      ...s,
    };
    // 触发更新
    this.subscribe();
  }
  // 执行插件中的某个事件（event），rest 作为参数传入
  runPluginHandler(event: keyof PluginReturn<TData, TParams>, ...rest: any[]) {
    // @ts-ignore
    const r = this.pluginImpls.map((i) => i[event]?.(...rest)).filter(Boolean); // 具有该事件（可以说生命周期）对插件，都执行一下对应的生命周期
    return Object.assign({}, ...r);
  }
  // 如果设置了 options.manual = true，则 useRequest 不会默认执行，需要通过 run 或者 runAsync 来触发执行。
  // runAsync 是一个返回 Promise 的异步函数，如果使用 runAsync 来调用，则意味着你需要自己捕获异常。
  async runAsync(...params: TParams): Promise<TData> {
    // 请求次数+1
    this.count += 1;
    // 主要为了 cancel 请求
    const currentCount = this.count;

    const {
      stopNow = false,
      returnNow = false,
      ...state
    } = this.runPluginHandler('onBefore', params); // 请求前钩子
    // AutoRunPlugin 插件 before钩子会返回一个 stopNow 如果为true 不会发起请求（根据用户参数 ready来的）
    // stop request
    if (stopNow) {
      return new Promise(() => {});
    }

    this.setState({
      loading: true, // 开始请求 loading状态
      params,
      ...state,
    });
    // 立即返回，跟缓存策略有关
    // return now
    if (returnNow) {
      return Promise.resolve(state.data);
    }
    // onBefore - 请求之前触发 是用户自定义的钩子
    // 假如有缓存数据，则直接返回
    this.options.onBefore?.(params);

    try {
      // replace service
      let { servicePromise } = this.runPluginHandler('onRequest', this.serviceRef.current, params); // 如果有 cache 的实例，则使用缓存的实例 useCachePlugin

      if (!servicePromise) {
        // 没有缓存实例 那就开始本次真正的请求了
        servicePromise = this.serviceRef.current(...params);
      }
      // 拿到请求结果 等待promise的成功
      const res = await servicePromise;
      // 如果调用了 cancel函数取消请求 就会发现不相等 那么请求结束
      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {});
      }

      // const formattedResult = this.options.formatResultRef.current ? this.options.formatResultRef.current(res) : res;

      this.setState({
        data: res,
        error: undefined,
        loading: false,
      });
      // 用户请求成功的钩子
      this.options.onSuccess?.(res, params);
      // 插件的 请求成功方法
      this.runPluginHandler('onSuccess', res, params);
      // 用户的 本次请求结束的钩子
      this.options.onFinally?.(params, res, undefined);
      // 相等表示本次请求没有被取消，去执行插件的请求结束钩子
      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, res, undefined);
      }
      // 返回请求结果
      return res;
    } catch (error) {
      // 请求失败了 service函数执行失败
      // 请求取消了 返回一个没有结果的promise
      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {});
      }
      // 请求失败 给一个error
      this.setState({
        error,
        loading: false,
      });
      // 用户自定义的请求失败钩子
      this.options.onError?.(error, params);
      // 执行所有插件的请求失败函数
      this.runPluginHandler('onError', error, params);
      // 用户的 本次请求结束的钩子
      this.options.onFinally?.(params, undefined, error);

      if (currentCount === this.count) {
        // 相等表示本次请求没有被取消，去执行插件的请求结束钩子
        this.runPluginHandler('onFinally', params, undefined, error);
      }
      // 抛出错误
      throw error;
    }
  }
  // run 是一个普通的同步函数，其内部也是调用了 runAsync 方法
  run(...params: TParams) {
    // run会手动捕获错误 如果用户定义了错误处理的钩子，则不会在控制台打印
    this.runAsync(...params).catch((error) => {
      if (!this.options.onError) {
        console.error(error);
      }
    });
  }
  // 取消当前正在进行的请求
  cancel() {
    // 设置 + 1，在执行 runAsync 的时候，就会发现 currentCount !== this.count，从而达到取消请求的目的
    this.count += 1;
    this.setState({
      loading: false, // 请求都取消了 loading false
    });
    // 执行 plugin 中所有的 onCancel 方法
    this.runPluginHandler('onCancel');
  }
  // 使用上一次的 params，重新调用 run
  refresh() {
    // @ts-ignore
    this.run(...(this.state.params || []));
  }
  // 使用上一次的 params，重新调用 runAsync
  refreshAsync() {
    // @ts-ignore
    return this.runAsync(...(this.state.params || []));
  }
  // 修改 data。参数可以为函数，也可以是一个值
  mutate(data?: TData | ((oldData?: TData) => TData | undefined)) {
    const targetData = isFunction(data) ? data(this.state.data) : data;
    // 触发data改变事件
    this.runPluginHandler('onMutate', targetData);
    this.setState({
      data: targetData,
    });
  }
}
