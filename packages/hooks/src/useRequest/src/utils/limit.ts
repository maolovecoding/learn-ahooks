export default function limit(fn: any, timespan: number) {
  // 其实就是 lock的概念 认为上次请求还没结束 不发起下次请求
  // 设置一个标识位，标识还在 pending 阶段，不应该进行请求
  let pending = false;
  return (...args: any[]) => {
    if (pending) return;
    pending = true;
    fn(...args);
    setTimeout(() => {
      pending = false;
    }, timespan);
  };
}
