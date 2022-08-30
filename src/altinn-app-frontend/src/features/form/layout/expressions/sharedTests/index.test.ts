import dot from 'dot-object';

import { evalExpr } from 'src/features/form/layout/expressions';
import { NodeNotFoundWithoutContext } from 'src/features/form/layout/expressions/errors';
import sharedTests from 'src/features/form/layout/expressions/sharedTests/index';
import { getRepeatingGroups } from 'src/utils/formLayout';
import {
  LayoutRootNodeCollection,
  nodesInLayout,
} from 'src/utils/layout/hierarchy';
import type { ILayouts } from 'src/features/form/layout';
import type { ContextDataSources } from 'src/features/form/layout/expressions/ExpressionContext';
import type { ILayoutExpression } from 'src/features/form/layout/expressions/types';

import type {
  IApplicationSettings,
  IInstanceContext,
} from 'altinn-shared/types';

interface TestDescription {
  name: string;
  expression: ILayoutExpression;
  expects: any;
  context?: {
    component?: string;
    rowIndices?: number[];
    currentLayout?: string;
  };
  layouts?: ILayouts;
  dataModel?: any;
  instanceContext?: IInstanceContext;
  appSettings?: IApplicationSettings;
}

function toComponentId({ component, rowIndices }: TestDescription['context']) {
  return (
    (component || 'no-component') +
    (rowIndices ? `-${rowIndices.join('-')}` : '')
  );
}

describe('Layout expressions shared tests', () => {
  it.each(sharedTests)('$name', (_input) => {
    const {
      expression,
      expects,
      context,
      layouts,
      dataModel,
      instanceContext,
      appSettings,
    } = _input as TestDescription;

    const dataSources: ContextDataSources = {
      formData: dataModel ? dot.dot(dataModel) : {},
      instanceContext: instanceContext || ({} as IInstanceContext),
      applicationSettings: appSettings || ({} as IApplicationSettings),
    };

    const asNodes = {};
    for (const key of Object.keys(layouts || {})) {
      const repeatingGroups = getRepeatingGroups(
        layouts[key],
        dataSources.formData,
      );
      asNodes[key] = nodesInLayout(layouts[key], repeatingGroups);
    }

    const currentLayout = (context && context.currentLayout) || '';
    const rootCollection = new LayoutRootNodeCollection(
      currentLayout as keyof typeof asNodes,
      asNodes,
    );
    const componentId = context ? toComponentId(context) : 'no-component';
    const component = rootCollection.findComponentById(componentId);

    expect(
      evalExpr(
        expression,
        component || new NodeNotFoundWithoutContext(componentId),
        dataSources,
      ),
    ).toEqual(expects);
  });
});
