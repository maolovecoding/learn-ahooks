import type { DependencyList } from 'react';

/**
 * 依赖的浅层比较
 * @param oldDeps
 * @param deps
 * @returns
 */
export default function depsAreSame(oldDeps: DependencyList, deps: DependencyList): boolean {
  if (oldDeps === deps) return true;
  for (let i = 0; i < oldDeps.length; i++) {
    // TODO 为什么用is？ 类似 NaN也是认为相等的
    if (!Object.is(oldDeps[i], deps[i])) return false;
  }
  return true;
}
