import { parseDsl } from 'src/features/form/layout/expressions/dsl';
import { runExpr } from 'src/features/form/layout/expressions/runner';
import type { ILayoutExpressionRunnerLookups } from 'src/features/form/layout/expressions/types';

describe('Layout expression runner', () => {
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

  const deps: ILayoutExpressionRunnerLookups = {
    dataModel: pretendDep,
    component: pretendDep,
    applicationSettings: pretendDep,
    instanceContext: pretendDep,
  };

  const cases: { expr: string; result: boolean }[] = [
    {
      expr: 'component(true) == component(false)',
      result: false,
    },
    {
      expr: 'component(true) != component(false)',
      result: true,
    },
    {
      expr: 'component(true) == component(true)',
      result: true,
    },
    {
      expr: 'component(true) == true',
      result: true,
    },
    {
      expr: 'true == component(true)',
      result: true,
    },
    {
      expr: 'true == true',
      result: true,
    },
    {
      expr: '5 > 3',
      result: true,
    },
    {
      expr: '5 < 7',
      result: true,
    },
    {
      expr: '5 > 7',
      result: false,
    },
    {
      expr: '5 >= 5',
      result: true,
    },
    {
      expr: '5 <= component(5)',
      result: true,
    },
    {
      expr: "'hello world' == component(hello world)",
      result: true,
    },
    {
      expr: '5 != 7',
      result: true,
    },
  ];

  it.each(cases)(
    'should return $result for expression $expr',
    ({ expr, result }) => {
      expect(runExpr(parseDsl(expr), deps)).toEqual(result);
    },
  );
});
