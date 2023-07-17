import { useRef } from 'react';

/**
 * This can safely be used inside the render function of a component without spamming the logs
 * on every rerender; as long as the message is not changed each time it is called.
 */
export const useLogs = () => {
  const logged = useRef(new Set<string>());

  function logOnce(message: string, severity: 'info' | 'warn' | 'error') {
    const logKey = `${severity}-${message}`;
    if (!logged.current.has(logKey)) {
      switch (severity) {
        case 'info':
          window.logInfo(message);
          break;
        case 'warn':
          window.logWarn(message);
          break;
        case 'error':
          window.logError(message);
          break;
      }
      logged.current.add(logKey);
    }
  }

  const logInfo = (message: string) => logOnce(message, 'info');
  const logWarn = (message: string) => logOnce(message, 'warn');
  const logError = (message: string) => logOnce(message, 'error');

  return { logInfo, logWarn, logError };
};
