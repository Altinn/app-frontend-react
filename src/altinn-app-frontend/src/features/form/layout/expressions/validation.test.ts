import { getSharedTests } from 'src/features/form/layout/expressions/shared-tests';
import { asLayoutExpression } from 'src/features/form/layout/expressions/validation';
import type { LayoutExpression } from 'src/features/form/layout/expressions/types';

describe('Layout expression validation', () => {
  const validObjects: LayoutExpression[] = [
    { function: 'equals', args: [5, 7] },
  ];

  it.each(validObjects)(
    'should validate %p as a valid expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr)).toEqual(maybeExpr);
    },
  );

  const sharedTests = getSharedTests();
  const invalidSharedTests = sharedTests['invalid'];
  delete sharedTests['invalid'];
  const sharedTestsFlat = Object.values(sharedTests).flat();

  it.each(sharedTestsFlat.map((testCase) => testCase.expression))(
    'should validate %j as a valid expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr)).toEqual(maybeExpr);
    },
  );

  describe('Shared tests for invalid expressions', () => {
    it.each(invalidSharedTests)('$name', (invalid) => {
      expect(() => asLayoutExpression(invalid.expression)).toThrow(
        invalid.expectsFailure,
      );
    });
  });

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

  // TODO: Add more test-cases and verify the error message
  it.each([
    { function: 'testNonExisting', args: [] },
    {
      function: 'equals',
      args: [{ function: 'testNonExisting', args: ['hello'] }, 'world'],
    },
    { function: 'equals', args: [] },
    { function: 'equals', args: [1, 2, 3] },
  ])(
    'should validate %j as an invalid expression (throwing exception)',
    (maybeExpr) => {
      expect(() => asLayoutExpression(maybeExpr)).toThrow();
    },
  );
});
