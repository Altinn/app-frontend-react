import dot from 'dot-object';

import { evalExpr } from 'src/features/form/layout/expressions';
import { NodeNotFoundWithoutContext } from 'src/features/form/layout/expressions/errors';
import { getSharedTests } from 'src/features/form/layout/expressions/shared-tests/index';
import { getRepeatingGroups, splitDashedKey } from 'src/utils/formLayout';
import {
  LayoutRootNodeCollection,
  nodesInLayout,
} from 'src/utils/layout/hierarchy';
import type { ContextDataSources } from 'src/features/form/layout/expressions/LEContext';
import type {
  FunctionTest,
  SharedTestContext,
} from 'src/features/form/layout/expressions/shared-tests/index';

import type {
  IApplicationSettings,
  IInstanceContext,
} from 'altinn-shared/types';

function toComponentId({ component, rowIndices }: FunctionTest['context']) {
  return (
    (component || 'no-component') +
    (rowIndices ? `-${rowIndices.join('-')}` : '')
  );
}

describe('Layout expressions shared function tests', () => {
  const sharedTests = getSharedTests('functions');

  describe.each(sharedTests.content)('Function: $folderName', (folder) => {
    it.each(folder.content)(
      '$name',
      ({
        expression,
        expects,
        expectsFailure,
        context,
        layouts,
        dataModel,
        instanceContext,
        frontendSettings,
      }) => {
        const dataSources: ContextDataSources = {
          formData: dataModel ? dot.dot(dataModel) : {},
          instanceContext: instanceContext || ({} as IInstanceContext),
          applicationSettings: frontendSettings || ({} as IApplicationSettings),
        };

        const asNodes = {};
        for (const key of Object.keys(layouts || {})) {
          const repeatingGroups = getRepeatingGroups(
            layouts[key].data.layout,
            dataSources.formData,
          );
          asNodes[key] = nodesInLayout(
            layouts[key].data.layout,
            repeatingGroups,
          );
        }

        const currentLayout = (context && context.currentLayout) || '';
        const rootCollection = new LayoutRootNodeCollection(
          currentLayout as keyof typeof asNodes,
          asNodes,
        );
        const componentId = context ? toComponentId(context) : 'no-component';
        const component =
          rootCollection.findComponentById(componentId) ||
          new NodeNotFoundWithoutContext(componentId);

        if (expectsFailure) {
          expect(() => evalExpr(expression, component, dataSources)).toThrow(
            expectsFailure,
          );
        } else {
          expect(evalExpr(expression, component, dataSources)).toEqual(expects);
        }
      },
    );
  });
});

describe('Layout expressions shared context tests', () => {
  const sharedTests = getSharedTests('context-lists');

  function contextSorter(
    a: SharedTestContext,
    b: SharedTestContext,
  ): -1 | 0 | 1 {
    if (a.component === b.component) {
      return 0;
    }

    return a.component > b.component ? 1 : -1;
  }

  describe.each(sharedTests.content)('$folderName', (folder) => {
    it.each(folder.content)(
      '$name',
      ({
        layouts,
        dataModel,
        instanceContext,
        frontendSettings,
        expectedContexts,
      }) => {
        const dataSources: ContextDataSources = {
          formData: dataModel ? dot.dot(dataModel) : {},
          instanceContext: instanceContext || ({} as IInstanceContext),
          applicationSettings: frontendSettings || ({} as IApplicationSettings),
        };

        const foundContexts: SharedTestContext[] = [];

        for (const key of Object.keys(layouts || {})) {
          const repeatingGroups = getRepeatingGroups(
            layouts[key].data.layout,
            dataSources.formData,
          );
          const nodes = nodesInLayout(
            layouts[key].data.layout,
            repeatingGroups,
          );

          for (const node of nodes.flat(true)) {
            const splitKey = splitDashedKey(node.item.id);
            const context: SharedTestContext = {
              component: splitKey.baseComponentId,
              currentLayout: key,
            };
            if (splitKey.depth.length) {
              context.rowIndices = splitKey.depth;
            }

            foundContexts.push(context);
          }
        }

        expect(foundContexts.sort(contextSorter)).toEqual(
          expectedContexts.sort(contextSorter),
        );
      },
    );
  });
});
