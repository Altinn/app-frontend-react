import {
  asLayoutExpression,
  evalExpr,
} from 'src/features/form/layout/expressions/expressions';
import type {
  ILayoutExpression,
  ILayoutExpressionRunnerLookups,
} from 'src/features/form/layout/expressions/types';

describe('Layout expression', () => {
  const pretendDep = (input) => {
    const value = input.trim();
    if (value.match(/^(true|false)$/)) {
      return value === 'true';
    }
    if (value.match(/^\d+$/)) {
      return parseInt(value, 10);
    }
    return value;
  };

  const lookups: ILayoutExpressionRunnerLookups = {
    dataModel: pretendDep,
    component: pretendDep,
    applicationSettings: pretendDep,
    instanceContext: pretendDep,
  };

  const cases: { expr: ILayoutExpression; result: any }[] = [
    {
      expr: {
        function: 'equals',
        args: [{ component: 'true' }, { component: 'false' }],
      },
      result: false,
    },
    {
      expr: {
        function: 'notEquals',
        args: [{ component: 'true' }, { component: 'false' }],
      },
      result: true,
    },
    {
      expr: {
        function: 'equals',
        args: [{ component: 'true' }, { component: 'true' }],
      },
      result: true,
    },
    {
      expr: {
        function: 'equals',
        args: [{ component: 'true' }, true],
      },
      result: true,
    },
    {
      expr: {
        function: 'equals',
        args: [true, { component: 'true' }],
      },
      result: true,
    },
    {
      expr: {
        function: 'equals',
        args: [true, true],
      },
      result: true,
    },
    {
      expr: {
        function: 'greaterThan',
        args: [5, 3],
      },
      result: true,
    },
    {
      expr: {
        function: 'lessThan',
        args: [5, 7],
      },
      result: true,
    },
    {
      expr: {
        function: 'greaterThan',
        args: [5, 7],
      },
      result: false,
    },
    {
      expr: {
        function: 'greaterThanEq',
        args: [5, 5],
      },
      result: true,
    },
    {
      expr: {
        function: 'lessThanEq',
        args: [5, { component: '5' }],
      },
      result: true,
    },
    {
      expr: {
        function: 'equals',
        args: ['hello world', { component: 'hello world' }],
      },
      result: true,
    },
    {
      expr: {
        function: 'notEquals',
        args: [5, 7],
      },
      result: true,
    },
  ];

  it.each(cases)(
    'should return $result for expression $expr',
    ({ expr, result }) => {
      expect(evalExpr(expr, lookups)).toEqual(result);
    },
  );

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

  it.each(cases.map((c) => c.expr))(
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
