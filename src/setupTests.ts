/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import 'jest';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/jest-globals';
import 'core-js/stable/structured-clone'; // https://github.com/jsdom/jsdom/issues/3363

import { configure as testingLibraryConfigure } from '@testing-library/dom';
import dotenv from 'dotenv';
import { jestPreviewConfigure } from 'jest-preview';
import { TextDecoder, TextEncoder } from 'util';

// Importing CSS for jest-preview to look nicer
import 'src/index.css';
import 'src/styles/shared.css';
import '@digdir/designsystemet-theme/brand/altinn/tokens.css';

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

window.inUnitTest = true;

// org and app is assigned to window object, so to avoid 'undefined' in tests, they need to be set
window.org = 'ttd';
window.app = 'test';

window.logError = (...args) => {
  // eslint-disable-next-line no-console
  console.log(args.join(' '));
};
window.logWarn = window.logError;
window.logInfo = window.logError;
window.logErrorOnce = window.logError;
window.logWarnOnce = window.logError;
window.logInfoOnce = window.logError;

window.scrollTo = () => {};

jest.setTimeout(env.parsed?.JEST_TIMEOUT ? parseInt(env.parsed.JEST_TIMEOUT, 10) : 20000);

jest.mock('axios');

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

global.ResizeObserver = require('resize-observer-polyfill');

const autoPreview = env.parsed?.JEST_PREVIEW_AUTO ? env.parsed.JEST_PREVIEW_AUTO === 'true' : false;
jestPreviewConfigure({ autoPreview });

testingLibraryConfigure({
  asyncUtilTimeout: env.parsed?.WAITFOR_TIMEOUT ? parseInt(env.parsed.WAITFOR_TIMEOUT, 10) : 15000,
});
