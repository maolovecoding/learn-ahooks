// from swr
import isBrowser from '../../../utils/isBrowser';
import isDocumentVisible from './isDocumentVisible';
import isOnline from './isOnline';

type Listener = () => void;

const listeners: Listener[] = [];

function subscribe(listener: Listener) {
  listeners.push(listener);
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

if (isBrowser) {
  const revalidate = () => {
    if (!isDocumentVisible() || !isOnline()) return;
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  };
  // 监听 visibilitychange 和 focus 事件
  window.addEventListener('visibilitychange', revalidate, false);
  window.addEventListener('focus', revalidate, false);
}

export default subscribe;
