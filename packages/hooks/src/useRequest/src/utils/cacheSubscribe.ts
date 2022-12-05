type Listener = (data: any) => void;
const listeners: Record<string, Listener[]> = {};
/**
 * 值更新 通知订阅
 * @param key
 * @param data
 */
const trigger = (key: string, data: any) => {
  if (listeners[key]) {
    listeners[key].forEach((item) => item(data));
  }
};
/**
 * 订阅值
 * @param key
 * @param listener
 * @returns
 */
const subscribe = (key: string, listener: Listener) => {
  if (!listeners[key]) {
    listeners[key] = [];
  }
  listeners[key].push(listener);
  // 取消订阅函数
  return function unsubscribe() {
    const index = listeners[key].indexOf(listener);
    listeners[key].splice(index, 1);
  };
};

export { trigger, subscribe };
