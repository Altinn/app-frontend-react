import { parseDsl } from 'src/features/form/layout/expressions/dsl';
import type { ILayoutExpressionStructured } from 'src/features/form/layout/expressions/types';

describe('Layout expression DSL', () => {
  it.each([
    undefined,
    null,
    'obviously bogus',
    'component(whatever)!=component(other-stuff)',
    'component(whatever) ! component(other-stuff)',
    'component(whatever) != component()',
    'component(whatever) != var(other-stuff)',
    'component(whatever) != \'malformed quotes"',
    'applicationSettings(something-else) == "double quotes"',
    'something(whatever)',
  ])('should not parse when input is %p', (input) => {
    expect(parseDsl(input, false)).toBeUndefined();
  });

  const validExpressions: {
    expr: string;
    result: ILayoutExpressionStructured<any>;
  }[] = [
    {
      expr: 'dataModel(MyModel.Group.Field) == component(my-input-field)',
      result: {
        function: 'equals',
        args: [
          { dataModel: 'MyModel.Group.Field' },
          { component: 'my-input-field' },
        ],
      } as ILayoutExpressionStructured<'equals'>,
    },
    {
      expr: 'component(whatever) != component(other-stuff)',
      result: {
        function: 'notEquals',
        args: [{ component: 'whatever' }, { component: 'other-stuff' }],
      } as ILayoutExpressionStructured<'notEquals'>,
    },
    {
      expr: 'component(whatever)  > component(other-stuff)',
      result: {
        function: 'greaterThan',
        args: [{ component: 'whatever' }, { component: 'other-stuff' }],
      } as ILayoutExpressionStructured<'greaterThan'>,
    },
    {
      expr: 'component(whatever) lessThan   component(other-stuff)',
      result: {
        function: 'lessThan',
        args: [{ component: 'whatever' }, { component: 'other-stuff' }],
      } as ILayoutExpressionStructured<'lessThan'>,
    },
    {
      expr: 'component(whatever) >= component(other-stuff)',
      result: {
        function: 'greaterThanEq',
        args: [{ component: 'whatever' }, { component: 'other-stuff' }],
      } as ILayoutExpressionStructured<'greaterThanEq'>,
    },
    {
      expr: ' component(whatever) lessThanEq component(other-stuff)',
      result: {
        function: 'lessThanEq',
        args: [{ component: 'whatever' }, { component: 'other-stuff' }],
      } as ILayoutExpressionStructured<'lessThanEq'>,
    },
    {
      expr: 'true ==   component(other-stuff) ',
      result: {
        function: 'equals',
        args: [true, { component: 'other-stuff' }],
      } as ILayoutExpressionStructured<'equals'>,
    },
    {
      expr: 'instanceContext(something) == false',
      result: {
        function: 'equals',
        args: [{ instanceContext: 'something' }, false],
      } as ILayoutExpressionStructured<'equals'>,
    },
    {
      expr: 'applicationSettings(something-else) >= 5',
      result: {
        function: 'greaterThanEq',
        args: [{ applicationSettings: 'something-else' }, 5],
      } as ILayoutExpressionStructured<'greaterThanEq'>,
    },
    {
      expr: 'applicationSettings(something-else) >= -5',
      result: {
        function: 'greaterThanEq',
        args: [{ applicationSettings: 'something-else' }, -5],
      } as ILayoutExpressionStructured<'greaterThanEq'>,
    },
    {
      expr: 'applicationSettings(something-else) == null',
      result: {
        function: 'equals',
        args: [{ applicationSettings: 'something-else' }, null],
      } as ILayoutExpressionStructured<'equals'>,
    },
    {
      expr: "applicationSettings(something-else) == 'hello world'",
      result: {
        function: 'equals',
        args: [{ applicationSettings: 'something-else' }, 'hello world'],
      } as ILayoutExpressionStructured<'equals'>,
    },
    {
      expr: 'dataModel(whatever)',
      result: {
        function: 'lookup',
        args: [{ dataModel: 'whatever' }],
      } as ILayoutExpressionStructured<'lookup'>,
    },
    {
      expr: '5',
      result: {
        function: 'lookup',
        args: [5],
      } as ILayoutExpressionStructured<'lookup'>,
    },
    {
      expr: 'true',
      result: {
        function: 'lookup',
        args: [true],
      } as ILayoutExpressionStructured<'lookup'>,
    },
  ];

  it.each(validExpressions)(
    'should parse the expression $expr',
    ({ expr, result }) => {
      expect(parseDsl(expr, false)).toEqual(result);
    },
  );
});
