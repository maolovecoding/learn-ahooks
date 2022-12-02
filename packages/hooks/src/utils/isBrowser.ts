const isBrowser = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
); // 浏览器平台

export default isBrowser;
