import { getSharedTests } from 'src/features/form/layout/expressions/shared-tests/index.test';
import { asLayoutExpression } from 'src/features/form/layout/expressions/validation';
import type { ILayoutExpression } from 'src/features/form/layout/expressions/types';

describe('Layout expression validation', () => {
  const validObjects: ILayoutExpression[] = [
    { function: 'equals', args: [5, 7] },
  ];
  const invalidObjects = [
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
  ];

  it.each(validObjects)(
    'should validate %p as a valid expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr)).toEqual(maybeExpr);
    },
  );

  const sharedTests = getSharedTests();
  const sharedTestsFlat = Object.values(sharedTests).flat();

  it.each(sharedTestsFlat.map((testCase) => testCase.expression))(
    'should validate %j as a valid expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr)).toEqual(maybeExpr);
    },
  );

  it.each(invalidObjects)(
    'should validate %p as an invalid expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr)).toBeUndefined();
    },
  );
});
