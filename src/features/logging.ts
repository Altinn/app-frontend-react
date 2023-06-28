let index = 0;
function postLog(level: string, args: any[]) {
  if (window.reduxStore) {
    const message = args
      .map((a) => {
        if (typeof a === 'object') {
          return JSON.stringify(a);
        }
        return String(a);
      })
      .join(' ');
    window.reduxStore.dispatch({ type: 'devTools/postLog', payload: { index, level, message } });
    index++;
  }
}

window.logError = (...args: any[]) => {
  postLog('error', args);
  console.error(...args);
};

window.logWarn = (...args: any[]) => {
  postLog('warn', args);
  console.warn(...args);
};

window.logInfo = (...args: any[]) => {
  postLog('info', args);
  console.info(...args);
};
