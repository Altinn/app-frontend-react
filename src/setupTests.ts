import 'jest';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/jest-globals';
import 'core-js/stable/structured-clone'; // https://github.com/jsdom/jsdom/issues/3363

import dotenv from 'dotenv';
import { TextDecoder, TextEncoder } from 'util';

import type { AppQueries } from 'src/contexts/appQueriesContext';

const env = dotenv.config();

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(document, 'fonts', {
  value: { ready: Promise.resolve({}) },
});

// Forcing a low timeout for useDelayedSaveState()
(global as any).delayedSaveState = 50;

// org and app is assigned to window object, so to avoid 'undefined' in tests, they need to be set
window.org = 'ttd';
window.app = 'test';
window.instanceId = 'test-instance-id';

window.logError = (...args) => {
  throw new Error(args.join(' '));
};
window.logWarn = window.logError;
window.logInfo = window.logError;
window.logErrorOnce = window.logError;
window.logWarnOnce = window.logError;
window.logInfoOnce = window.logError;

jest.setTimeout(env.parsed?.JEST_TIMEOUT ? parseInt(env.parsed.JEST_TIMEOUT, 10) : 10000);

jest.mock('axios');

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

(async () => {
  // These need to run after TextEncoder and TextDecoder has been set above, because we can't start importing our code
  // before these are present. We also need to set up the store at least once first, so that saga slice actions have
  // been assigned.

  const setupStore = (await import('src/redux/store')).setupStore;
  const initSagas = (await import('src/redux/sagas')).initSagas;

  const { sagaMiddleware } = setupStore();
  initSagas(sagaMiddleware);
})();

global.ResizeObserver = require('resize-observer-polyfill');

type QueriesAsMocks = {
  [K in keyof AppQueries]: jest.Mock;
};
interface ExpectLoadingSpec {
  loadingReason: string;
  queries: QueriesAsMocks;
  dispatchedActions: any[];
  ignoredActions: any[];
}

expect.extend({
  toNotBeLoading: ({ loadingReason, queries, dispatchedActions, ignoredActions }: ExpectLoadingSpec) => {
    if (loadingReason) {
      return {
        message: () => {
          const queryCalls: string[] = [];
          for (const [name, { mock }] of Object.entries(queries)) {
            if (mock.calls.length > 0) {
              for (const args of mock.calls) {
                const argsAsStr = args.map((arg: any) => JSON.stringify(arg)).join(', ');
                queryCalls.push(`- ${name}(${argsAsStr})`);
              }
            }
          }

          const dispatched: string[] = [];
          for (const action of dispatchedActions) {
            dispatched.push(`- ${JSON.stringify(action)}`);
          }

          const ignored: string[] = [];
          for (const action of ignoredActions) {
            ignored.push(`- ${JSON.stringify(action)}`);
          }

          return [
            `Expected to not be loading, but was loading because of '${loadingReason}'.`,
            '',
            `Queries called:`,
            ...queryCalls,
            '',
            'Dispatched actions:',
            ...dispatched,
            '',
            'Ignored actions:',
            ...ignored,
            '',
            'Consider if you need to increase RENDER_WAIT_TIMEOUT if your machine is slow.',
          ].join('\n');
        },
        pass: false,
      };
    }

    return {
      message: () => `Expected to not be loading, and no current loading reason was found`,
      pass: true,
    };
  },
});
