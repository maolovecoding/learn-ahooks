import useBoolean from '../useBoolean';
import useEventListener from '../useEventListener';
import type { BasicTarget } from '../utils/domTarget';

export interface Options {
  onEnter?: () => void;
  onLeave?: () => void;
  onChange?: (isHovering: boolean) => void;
}

/**
 * 其实就是监听鼠标的移入和移出事件
 */
export default (target: BasicTarget, options?: Options): boolean => {
  const { onEnter, onLeave, onChange } = options || {};

  const [state, { setTrue, setFalse }] = useBoolean(false);

  useEventListener(
    'mouseenter',
    () => {
      // 鼠标移入回调，设置为true
      onEnter?.();
      setTrue();
      onChange?.(true);
    },
    {
      target,
    },
  );

  useEventListener(
    'mouseleave',
    () => {
      // 鼠标移出事件，设置为false
      onLeave?.();
      setFalse();
      onChange?.(false);
    },
    {
      target,
    },
  );
  // 返回当前的状态
  return state;
};
