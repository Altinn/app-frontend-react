import { evalExpr } from 'src/features/form/layout/expressions/expressions';
import type {
  ILayoutExpression,
  ILayoutExpressionRunnerLookups,
} from 'src/features/form/layout/expressions/types';

export const expressionTestCases: { expr: ILayoutExpression; result: any }[] = [
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

  it.each(expressionTestCases)(
    'should return $result for expression $expr',
    ({ expr, result }) => {
      expect(evalExpr(expr, lookups)).toEqual(result);
    },
  );
});
