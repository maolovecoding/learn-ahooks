import isBrowser from '../../../utils/isBrowser';
import isDocumentVisible from './isDocumentVisible';

type Listener = () => void;

const listeners: Listener[] = [];

/**
 * 订阅
 * @param listener
 * @returns
 */
function subscribe(listener: Listener) {
  listeners.push(listener);
  return function unsubscribe() {
    // 取消订阅
    const index = listeners.indexOf(listener);
    listeners.splice(index, 1);
  };
}

if (isBrowser) {
  // revalidate 在页面可见的时候 重新生效
  const revalidate = () => {
    if (!isDocumentVisible()) return;
    // 在页面可见的时候 重新生效
    for (let i = 0; i < listeners.length; i++) {
      // 执行订阅的事件
      const listener = listeners[i];
      listener();
    }
  };
  window.addEventListener('visibilitychange', revalidate, false);
}

export default subscribe;
