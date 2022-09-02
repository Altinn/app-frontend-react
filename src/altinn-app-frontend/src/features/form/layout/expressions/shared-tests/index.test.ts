import dot from 'dot-object';

import { evalExpr } from 'src/features/form/layout/expressions';
import { NodeNotFoundWithoutContext } from 'src/features/form/layout/expressions/errors';
import { getSharedTests } from 'src/features/form/layout/expressions/shared-tests/index';
import { getRepeatingGroups } from 'src/utils/formLayout';
import {
  LayoutRootNodeCollection,
  nodesInLayout,
} from 'src/utils/layout/hierarchy';
import type { ContextDataSources } from 'src/features/form/layout/expressions/LEContext';
import type { TestDescription } from 'src/features/form/layout/expressions/shared-tests/index';

import type {
  IApplicationSettings,
  IInstanceContext,
} from 'altinn-shared/types';

function toComponentId({ component, rowIndices }: TestDescription['context']) {
  return (
    (component || 'no-component') +
    (rowIndices ? `-${rowIndices.join('-')}` : '')
  );
}

describe('Layout expressions shared tests', () => {
  const sharedTests = getSharedTests();

  // These tests are invalid and should be stopped by the parser, so they would never be evaluated.
  // See validation.test.ts instead
  delete sharedTests['invalid'];

  describe.each(Object.keys(sharedTests))('Function: %s', (folder) => {
    it.each(sharedTests[folder])(
      '$name',
      ({
        expression,
        expects,
        expectsFailure,
        context,
        layouts,
        dataModel,
        instanceContext,
        appSettings,
      }) => {
        const dataSources: ContextDataSources = {
          formData: dataModel ? dot.dot(dataModel) : {},
          instanceContext: instanceContext || ({} as IInstanceContext),
          applicationSettings: appSettings || ({} as IApplicationSettings),
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
