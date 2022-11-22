import useLatest from '../useLatest';
import type { BasicTarget } from '../utils/domTarget';
import { getTargetElement } from '../utils/domTarget';
import useEffectWithTarget from '../utils/useEffectWithTarget';

type noop = (...p: any) => void;

export type Target = BasicTarget<HTMLElement | Element | Window | Document>;

type Options<T extends Target = Target> = {
  target?: T;
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
};

function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  options?: Options<HTMLElement>,
): void;
function useEventListener<K extends keyof ElementEventMap>(
  eventName: K,
  handler: (ev: ElementEventMap[K]) => void,
  options?: Options<Element>,
): void;
function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (ev: DocumentEventMap[K]) => void,
  options?: Options<Document>,
): void;
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (ev: WindowEventMap[K]) => void,
  options?: Options<Window>,
): void;
function useEventListener(eventName: string, handler: noop, options: Options): void;
/**
 *
 * @param eventName 事件名
 * @param handler 处理函数
 * @param options 额外配置 （和原生监听函数保持一致）
 */

function useEventListener(eventName: string, handler: noop, options: Options = {}) {
  // 处理函数 防止闭包问题
  const handlerRef = useLatest(handler);

  useEffectWithTarget(
    () => {
      // 目标元素
      const targetElement = getTargetElement(options.target, window);
      // 有没有 addEventListener方法
      if (!targetElement?.addEventListener) {
        return;
      }
      // 包一层事件监听函数
      const eventListener = (event: Event) => {
        // 通过ref 拿到的是没有闭包影响的最新的函数 执行
        return handlerRef.current(event);
      };

      targetElement.addEventListener(eventName, eventListener, {
        capture: options.capture, // 捕获
        once: options.once, // 执行一次 就会移除该监听函数了
        passive: options.passive, // TODO 不允许取消该事件的默认行为 event.preventDefault() 不生效
      });

      return () => {
        // 卸载时 取消监听
        targetElement.removeEventListener(eventName, eventListener, {
          capture: options.capture,
        });
      };
    },
    // 依赖发生改变时重新执行副作用
    [eventName, options.capture, options.once, options.passive],
    options.target,
  );
}

export default useEventListener;
