import { getInitialStateMock } from '__mocks__/initialStateMock';

import { evalExpr } from 'src/features/form/layout/expressions/index';
import { LayoutNode, LayoutRootNode } from 'src/utils/layout/hierarchy';
import type { ILayoutExpression } from 'src/features/form/layout/expressions/types';

import { buildInstanceContext } from 'altinn-shared/utils/instanceContext';

export const expressionTestCases: [any, ILayoutExpression][] = [
  [
    'true',
    {
      function: 'component',
      args: ['true'],
    },
  ],
  [
    false,
    {
      function: 'equals',
      args: [
        { function: 'component', args: ['test'] },
        { function: 'component', args: ['false'] },
      ],
    },
  ],
  [
    true,
    {
      function: 'notEquals',
      args: [
        { function: 'component', args: ['true'] },
        { function: 'component', args: ['false'] },
      ],
    },
  ],
  [
    true,
    {
      function: 'equals',
      args: [
        { function: 'component', args: ['true'] },
        { function: 'component', args: ['true'] },
      ],
    },
  ],
  [
    true,
    {
      function: 'equals',
      args: [{ function: 'component', args: ['true'] }, 'true'],
    },
  ],
  [
    true,
    {
      function: 'equals',
      args: ['true', { function: 'component', args: ['true'] }],
    },
  ],
  [
    true,
    {
      function: 'equals',
      args: ['true', 'true'],
    },
  ],
  [
    true,
    {
      function: 'greaterThan',
      args: [5, 3],
    },
  ],
  [
    true,
    {
      function: 'lessThan',
      args: [5, 7],
    },
  ],
  [
    false,
    {
      function: 'greaterThan',
      args: [5, 7],
    },
  ],
  [
    true,
    {
      function: 'greaterThanEq',
      args: [5, 5],
    },
  ],
  [
    true,
    {
      function: 'lessThanEq',
      args: ['5', { function: 'dataModel', args: ['5'] }],
    },
  ],
  [
    true,
    {
      function: 'equals',
      args: ['hello world', { function: 'dataModel', args: ['helloWorld'] }],
    },
  ],
  [
    true,
    {
      function: 'notEquals',
      args: [5, 7],
    },
  ],
];

describe('Layout expression', () => {
  const layoutRoot = new LayoutRootNode();
  const nodeTest = new LayoutNode(
    {
      id: 'test',
      type: 'Input',
      dataModelBindings: {
        simpleBinding: 'test',
      },
    },
    layoutRoot,
  );
  const nodeTrue = new LayoutNode(
    {
      id: 'true',
      type: 'Input',
      dataModelBindings: {
        simpleBinding: 'true',
      },
    },
    layoutRoot,
  );
  const nodeFalse = new LayoutNode(
    {
      id: 'false',
      type: 'Input',
      dataModelBindings: {
        simpleBinding: 'false',
      },
    },
    layoutRoot,
  );
  layoutRoot._addChild(nodeTest, layoutRoot);
  layoutRoot._addChild(nodeTrue, layoutRoot);
  layoutRoot._addChild(nodeFalse, layoutRoot);

  const initialState = getInitialStateMock();

  it.each(expressionTestCases)(
    'should return %j for expression %j',
    (result, expr) => {
      expect(
        evalExpr(expr, nodeTrue, {
          applicationSettings:
            initialState.applicationSettings.applicationSettings,
          instanceContext: buildInstanceContext(
            initialState.instanceData.instance,
          ),
          formData: {
            true: 'true',
            false: 'false',
            5: '5',
            helloWorld: 'hello world',
            test: 'test',
          },
        }),
      ).toEqual(result);
    },
  );
});
