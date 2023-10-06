export async function waitForSelector(selector: string, timeOut = 5000) {
  const start = performance.now();
  while (document.querySelector(selector) === null) {
    if (performance.now() - start > timeOut) {
      return null;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
}
