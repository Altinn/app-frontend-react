import { parseDsl } from 'src/features/form/layout/expressions/dsl';
import type { ILayoutExpression } from 'src/features/form/layout/expressions/types';

describe('Layout expression DSL', () => {
  it.each([
    undefined,
    null,
    'obviously bogus',
    'component(whatever)!=component(other-stuff)',
    'component(whatever) ! component(other-stuff)',
  ])('should not parse when input is %p', (input) => {
    expect(parseDsl(input, false)).toBeUndefined();
  });

  const validExpressions: { expr: string; result: ILayoutExpression }[] = [
    {
      expr: 'dataModel(MyModel.Group.Field) == component(my-input-field)',
      result: {
        function: 'equals',
        args: [
          { dataModel: 'MyModel.Group.Field' },
          { component: 'my-input-field' },
        ],
      },
    },
    {
      expr: 'component(whatever) != component(other-stuff)',
      result: {
        function: 'notEquals',
        args: [{ component: 'whatever' }, { component: 'other-stuff' }],
      },
    },
    {
      expr: 'component(whatever)  > component(other-stuff)',
      result: {
        function: 'greaterThan',
        args: [{ component: 'whatever' }, { component: 'other-stuff' }],
      },
    },
    {
      expr: 'component(whatever) lessThan   component(other-stuff)',
      result: {
        function: 'lessThan',
        args: [{ component: 'whatever' }, { component: 'other-stuff' }],
      },
    },
    {
      expr: 'component(whatever) >= component(other-stuff)',
      result: {
        function: 'greaterThanEq',
        args: [{ component: 'whatever' }, { component: 'other-stuff' }],
      },
    },
    {
      expr: 'component(whatever) lessThanEq component(other-stuff)',
      result: {
        function: 'lessThanEq',
        args: [{ component: 'whatever' }, { component: 'other-stuff' }],
      },
    },
    {
      expr: 'true == component(other-stuff)',
      result: {
        function: 'equals',
        args: [true, { component: 'other-stuff' }],
      },
    },
    {
      expr: 'instanceContext(something) == false',
      result: {
        function: 'equals',
        args: [{ instanceContext: 'something' }, false],
      },
    },
    {
      expr: 'applicationSettings(something-else) >= 5',
      result: {
        function: 'greaterThanEq',
        args: [{ applicationSettings: 'something-else' }, 5],
      },
    },
    {
      expr: 'applicationSettings(something-else) == hello world',
      result: {
        function: 'equals',
        args: [{ applicationSettings: 'something-else' }, 'hello world'],
      },
    },
    {
      // Malformed, but valid
      expr: 'component(whatever) != component()',
      result: {
        function: 'notEquals',
        args: [{ component: 'whatever' }, 'component()'],
      },
    },
    {
      // Malformed, but valid
      expr: 'component(whatever) != var(other-stuff)',
      result: {
        function: 'notEquals',
        args: [{ component: 'whatever' }, 'var(other-stuff)'],
      },
    },
  ];

  it.each(validExpressions)(
    'should parse the expression $expr',
    ({ expr, result }) => {
      expect(parseDsl(expr, false)).toEqual(result);
    },
  );
});
