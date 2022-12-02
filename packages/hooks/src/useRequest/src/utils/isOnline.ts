import isBrowser from '../../../utils/isBrowser';
/**
 *
 * @returns 在浏览器里面 且有网络
 */
export default function isOnline(): boolean {
  if (isBrowser && typeof navigator.onLine !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}
