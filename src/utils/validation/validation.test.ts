import type { ErrorObject } from 'ajv';

import { isOneOfError } from 'src/utils/validation/schemaValidation';

// Mock dateformat
jest.mock('src/utils/dateHelpers', () => ({
  __esModules: true,
  ...jest.requireActual('src/utils/dateHelpers'),
  getDateFormat: jest.fn(() => 'DD.MM.YYYY'),
}));

describe('utils > validation', () => {
  beforeEach(() => {
    /**
     * Silences deprecation warning about jsPropertySyntax from Ajv, so we don't pollute our test runner output with
     * these warnings. We already know about the deprecation of jsPropertySyntax, and our tests will fail if/when
     * AJV decides to completely remove support for this syntax.
     *
     * @see createValidator
     */
    const oldConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].match(/DEPRECATED: option jsPropertySyntax/)) {
        return;
      }

      oldConsoleWarn(...args);
    };
  });

  describe('isOneOfError', () => {
    it('should return fasle if provided error does not have keyword `oneOf`', () => {
      const error: ErrorObject = {
        keyword: 'test',
        instancePath: '',
        schemaPath: '',
        params: {},
      };
      const result = isOneOfError(error);
      expect(result).toBeFalsy();
    });
    it('should return true if provided error has keyword `oneOf`', () => {
      const error: ErrorObject = {
        keyword: 'oneOf',
        instancePath: '',
        schemaPath: '',
        params: {},
      };
      const result = isOneOfError(error);
      expect(result).toBeTruthy();
    });

    it('should return true if provided error has param "type: null"', () => {
      const error: ErrorObject = {
        keyword: 'test',
        instancePath: '',
        schemaPath: '',
        params: {
          type: 'null',
        },
      };
      const result = isOneOfError(error);
      expect(result).toBeTruthy();
    });
  });
});
