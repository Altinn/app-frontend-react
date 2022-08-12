import { expressionTestCases } from 'src/features/form/layout/expressions/expressions.test';
import { asLayoutExpression } from 'src/features/form/layout/expressions/validation';
import type { ILayoutExpression } from 'src/features/form/layout/expressions/types';

describe('Layout expression validation', () => {
  const validStructuredObjects: ILayoutExpression[] = [
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

  it.each(validStructuredObjects)(
    'should validate %p as a valid structured expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr, false)).toEqual(maybeExpr);
    },
  );

  it.each(expressionTestCases.map((c) => c.expr))(
    'should validate %p as a valid structured expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr, false)).toEqual(maybeExpr);
    },
  );

  it.each(invalidObjects)(
    'should validate %p as an invalid expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr, false)).toBeUndefined();
    },
  );
});
