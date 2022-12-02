import { useRef, useEffect } from 'react';

type Subscription<T> = (val: T) => void;

/**
 * 发布订阅
 */
export class EventEmitter<T> {
  // 记录订阅的函数（订阅者）
  private subscriptions = new Set<Subscription<T>>();

  emit = (val: T) => {
    for (const subscription of this.subscriptions) {
      // 通知订阅者
      subscription(val);
    }
  };
  // 添加订阅 其实用subscription岂不是更好？
  useSubscription = (callback: Subscription<T>) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const callbackRef = useRef<Subscription<T>>();
    // 保证订阅者是最新的函数
    callbackRef.current = callback;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      function subscription(val: T) {
        if (callbackRef.current) {
          // 真正的订阅者 执行
          callbackRef.current(val);
        }
      }
      this.subscriptions.add(subscription);
      return () => {
        // 组件卸载 当前的订阅者移除
        this.subscriptions.delete(subscription);
      };
    }, []);
  };
}

export default function useEventEmitter<T = void>() {
  const ref = useRef<EventEmitter<T>>();
  if (!ref.current) {
    ref.current = new EventEmitter();
  }
  // 更新的时候 返回的是同一个订阅者
  return ref.current;
}
