import { getSharedTests } from 'src/features/form/layout/expressions/shared';
import {
  asLayoutExpression,
  preProcessLayout,
} from 'src/features/form/layout/expressions/validation';

describe('Layout expression validation', () => {
  describe('Shared function tests should validate', () => {
    const sharedTests = getSharedTests('functions');
    const flat = sharedTests.content.map((td) => td.content).flat();
    it.each(flat.map((testCase) => testCase.expression))('%j', (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr)).toEqual(maybeExpr);
    });
  });

  describe('Shared tests for invalid expressions', () => {
    const invalidSharedTests = getSharedTests('invalid');
    it.each(invalidSharedTests.content)('$name', (invalid) => {
      expect(() => asLayoutExpression(invalid.expression)).toThrow(
        invalid.expectsFailure,
      );
    });
  });

  describe('Shared tests for layout preprocessor', () => {
    const tests = getSharedTests('layout-preprocessor');
    it.each(tests.content)('$name', (t) => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {
        return undefined;
      });

      const result: typeof tests['content'][number]['layouts'] = {};
      for (const page of Object.keys(t.layouts)) {
        const layout = t.layouts[page].data.layout;
        preProcessLayout(layout);
        result[page] = {
          $schema: t.layouts[page].$schema,
          data: { layout },
        };
      }

      expect(result).toEqual(t.expects);

      const warningsExpected = t.expectsWarnings || [];
      const warningsFound = [];
      for (const call of logSpy.mock.calls) {
        for (const warning of warningsExpected) {
          if ((call[0] as string).includes(`%c${warning}%c`)) {
            warningsFound.push(warning);
          }
        }
      }
      expect(warningsFound.sort()).toEqual(warningsExpected.sort());

      logSpy.mockRestore();
    });
  });

  describe('Shared tests for lisp-like expressions', () => {
    const tests = getSharedTests('lisp-like');
    it.each(tests.content)('$name', (lispLike) => {
      if (lispLike.expects) {
        expect(asLayoutExpression(lispLike.expression)).toEqual(
          lispLike.expects,
        );
      } else {
        expect(() => asLayoutExpression(lispLike.expression)).toThrow(
          lispLike.expectsFailure,
        );
      }
    });
  });

  describe('Some values/objects should not validate', () => {
    it.each([
      '',
      null,
      false,
      undefined,
      5,
      new Date(),
      [],
      [5, 6, 7],
      {},
      { hello: 'world' },
      { expr: 'hello world' },
      { expr: '5 == 5', and: 'other property' },
    ])(
      'should validate %p as an invalid expression (non-throwing)',
      (maybeExpr) => {
        expect(asLayoutExpression(maybeExpr)).toBeUndefined();
      },
    );
  });
});
