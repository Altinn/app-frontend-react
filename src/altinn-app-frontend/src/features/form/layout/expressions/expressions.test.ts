import { parseDsl } from 'src/features/form/layout/expressions/dsl';
import {
  asLayoutExpression,
  evalExpr,
} from 'src/features/form/layout/expressions/expressions';
import type {
  ILayoutExpressionRunnerLookups,
  ILayoutExpressionStructured,
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

  const deps: ILayoutExpressionRunnerLookups = {
    dataModel: pretendDep,
    component: pretendDep,
    applicationSettings: pretendDep,
    instanceContext: pretendDep,
  };

  const cases: { expr: string; result: any }[] = [
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
    {
      expr: '5',
      result: 5,
    },
    {
      expr: 'true',
      result: true,
    },
    {
      expr: 'null',
      result: null,
    },
    {
      expr: "'hello world'",
      result: 'hello world',
    },
    {
      expr: 'dataModel(testing)',
      result: 'testing',
    },
  ];

  it.each(cases)(
    'should return $result for expression $expr',
    ({ expr, result }) => {
      expect(evalExpr(parseDsl(expr), deps)).toEqual(result);
    },
  );

  const validStructuredObjects: ILayoutExpressionStructured[] = [
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

  it.each(cases.map((c) => parseDsl(c.expr, false)))(
    'should validate %p as a valid structured expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr, false)).toEqual(maybeExpr);
    },
  );

  it.each(cases.map((c) => ({ expr: c.expr })))(
    'should validate %p as a valid DSL expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr, false)).toBeTruthy();
    },
  );

  it.each(invalidObjects)(
    'should validate %p as an invalid expression',
    (maybeExpr) => {
      expect(asLayoutExpression(maybeExpr, false)).toBeUndefined();
    },
  );
});
