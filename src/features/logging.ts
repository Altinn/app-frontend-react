import { AxiosError } from 'axios';

let index = -1;
function postLog(level: string, args: any[]) {
  if (window.reduxStore) {
    index++;
    const message = parseArgs(args);
    window.reduxStore.dispatch({ type: 'devTools/postLog', payload: { index, level, message } });
  }
}

function parseArgs(args: any[]) {
  return args
    .map((arg) => {
      if (arg instanceof AxiosError) {
        return `Request failed, check the server logs for more details. ${arg.config?.method?.toUpperCase()} '${
          arg.config?.url
        }': ${arg.message}`;
      }
      if (typeof arg === 'object') {
        return JSON.stringify(arg);
      }
      return String(arg);
    })
    .join(' ');
}

window.logError = (...args: any[]) => {
  postLog('error', args);
};

window.logWarn = (...args: any[]) => {
  postLog('warn', args);
};

window.logInfo = (...args: any[]) => {
  postLog('info', args);
};
