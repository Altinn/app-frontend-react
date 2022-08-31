import dot from 'dot-object';
import fs from 'node:fs';

import { evalExpr } from 'src/features/form/layout/expressions';
import { NodeNotFoundWithoutContext } from 'src/features/form/layout/expressions/errors';
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
  expects?: any;
  expectsFailure?: string;
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
  const ignoredFiles = ['index.test.ts', 'README.md', 'generate.mjs'];
  const sharedTestFolders = fs
    .readdirSync(__dirname)
    .filter((name) => !ignoredFiles.includes(name));

  describe.each(sharedTestFolders)('Function: %s', (folder) => {
    const sharedTests = fs
      .readdirSync(`${__dirname}/${folder}`)
      .filter((f) => f.endsWith('.json'))
      .map((f) => fs.readFileSync(`${__dirname}/${folder}/${f}`))
      .map((testJson) => JSON.parse(testJson.toString()) as TestDescription);

    it.each(sharedTests)(
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
