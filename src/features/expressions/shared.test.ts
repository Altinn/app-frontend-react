/* eslint-disable @typescript-eslint/ban-ts-comment */
import dot from 'dot-object';

import { getExpressionDataSourcesMock } from 'src/__mocks__/getExpressionDataSourcesMock';
import { evalExpr } from 'src/features/expressions';
import { NodeNotFoundWithoutContext } from 'src/features/expressions/errors';
import { convertInstanceDataToAttachments, convertLayouts, getSharedTests } from 'src/features/expressions/shared';
import { ExprValidation } from 'src/features/expressions/validation';
import { resourcesAsMap } from 'src/features/language/textResources/resourcesAsMap';
import { staticUseLanguageForTests } from 'src/features/language/useLanguage';
import { castOptionsToStrings } from 'src/features/options/castOptionsToStrings';
import { getComponentDef } from 'src/layout';
import { buildAuthContext } from 'src/utils/authContext';
import { buildInstanceDataSources } from 'src/utils/instanceDataSources';
import { _private } from 'src/utils/layout/hierarchy';
import { generateEntireHierarchy, generateHierarchy } from 'src/utils/layout/HierarchyGenerator';
import { splitDashedKey } from 'src/utils/splitDashedKey';
import type { ExpressionDataSources } from 'src/features/expressions/ExprContext';
import type { FunctionTest, SharedTestContext, SharedTestContextList } from 'src/features/expressions/shared';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { IApplicationSettings } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

const { resolvedNodesInLayouts } = _private;

// TODO: Remove all ts-ignore comments in this file, and re-implement this with the new hierarchy generator

function findComponent(context: FunctionTest['context'], collection: LayoutPages) {
  const { component, rowIndices } = context || { component: 'no-component' };
  const componentId = (component || 'no-component') + (rowIndices ? `-${rowIndices.join('-')}` : '');
  // @ts-ignore
  const found = collection.findById(componentId);
  if (found) {
    return found;
  }

  if (component && rowIndices && rowIndices.length) {
    const componentId2 = `${component}-${rowIndices.slice(0, rowIndices.length - 1).join('-')}`.replace(/-+$/, '');
    // @ts-ignore
    const foundMaybeGroup = collection.findById(componentId2);
    if (foundMaybeGroup && foundMaybeGroup.isType('RepeatingGroup')) {
      // Special case for using a group component with a row index, looking up within the
      // group context, but actually pointing to a row inside the group. This is supported
      // in useExpressions() itself, but evalExpr() requires the context of an actual component
      // inside the group.
      const rowIndex = [...rowIndices].pop()!;
      // @ts-ignore
      return foundMaybeGroup.children(undefined, { onlyInRowIndex: rowIndex })[0];
    }
  }

  return new NodeNotFoundWithoutContext(componentId);
}

describe('Expressions shared function tests', () => {
  let preHash;
  beforeAll(() => {
    preHash = window.location.hash;
    window.location.hash = '#/instance/510001/d00ce51c-800b-416a-a906-ccab55f597e9/Task_3/grid';
  });
  afterAll(() => {
    window.location.hash = preHash;
  });

  const sharedTests = getSharedTests('functions');

  describe.each(sharedTests.content)('Function: $folderName', (folder) => {
    it.each(folder.content)(
      '$name',
      ({
        disabledFrontend,
        expression,
        expects,
        expectsFailure,
        context,
        layouts,
        dataModel,
        instanceDataElements,
        instance,
        process,
        permissions,
        frontendSettings,
        textResources,
        profileSettings,
      }) => {
        if (disabledFrontend) {
          // Skipped tests usually means that the frontend does not support the feature yet
          return;
        }

        const attachments = convertInstanceDataToAttachments(instanceDataElements);
        const options: { [nodeId: string]: IOptionInternal[] | undefined } = {};
        const dataSources: ExpressionDataSources = {
          ...getExpressionDataSourcesMock(),
          formDataSelector: (path) => dot.pick(path, dataModel ?? {}),
          attachmentsSelector: (node) => attachments[node.getId()] ?? [],
          instanceDataSources: buildInstanceDataSources(instance),
          applicationSettings: frontendSettings || ({} as IApplicationSettings),
          authContext: buildAuthContext(permissions),
          langToolsSelector: () =>
            staticUseLanguageForTests({
              textResources: textResources ? resourcesAsMap(textResources) : {},
            }),
          process,
          currentLanguage: profileSettings?.language || 'nb',
          optionsSelector: (node) => ({ options: options[node.getId()] || [], isFetching: false }),
        };

        const _layouts = convertLayouts(layouts);
        const currentLayout = (context && context.currentLayout) || '';
        const rootCollection = expectsFailure
          ? generateEntireHierarchy(_layouts, currentLayout, dataSources, getComponentDef)
          : resolvedNodesInLayouts(_layouts, currentLayout, dataSources);
        const component = findComponent(context, rootCollection);

        // @ts-ignore
        for (const node of rootCollection.allNodes()) {
          if ('options' in node.item) {
            // Extremely simple mock of useGetOptions() and useAllOptions(), assuming
            // all components use plain static options
            options[node.getId()] = castOptionsToStrings(node.item.options);
          }
        }

        if (expectsFailure) {
          expect(() => {
            ExprValidation.throwIfInvalidNorScalar(expression);
            return evalExpr(expression, component, dataSources);
          }).toThrow(expectsFailure);
        } else {
          // Simulate what happens in checkIfConditionalRulesShouldRunSaga()
          // @ts-ignore
          for (const layoutKey of Object.keys(rootCollection.all())) {
            // @ts-ignore
            const layout = rootCollection.findLayout(layoutKey);
            if (!layout) {
              throw new Error('No layout found - check your test data!');
            }
          }

          ExprValidation.throwIfInvalidNorScalar(expression);
          expect(evalExpr(expression, component, dataSources)).toEqual(expects);
        }
      },
    );
  });
});

describe('Expressions shared context tests', () => {
  const sharedTests = getSharedTests('context-lists');

  function contextSorter(a: SharedTestContext, b: SharedTestContext): -1 | 0 | 1 {
    if (a.component === b.component) {
      return 0;
    }

    return a.component > b.component ? 1 : -1;
  }

  function recurse(node: LayoutNode, key: string): SharedTestContextList {
    const splitKey = splitDashedKey(node.getId());
    const context: SharedTestContextList = {
      component: splitKey.baseComponentId,
      currentLayout: key,
    };
    // @ts-ignore
    const children = node.children().map((child) => recurse(child, key));
    if (children.length) {
      context.children = children;
    }
    if (splitKey.depth.length) {
      context.rowIndices = splitKey.depth;
    }

    return context;
  }

  describe.each(sharedTests.content)('$folderName', (folder) => {
    it.each(folder.content)(
      '$name',
      ({ layouts, dataModel, instanceDataElements, instance, frontendSettings, permissions, expectedContexts }) => {
        const attachments = convertInstanceDataToAttachments(instanceDataElements);
        const dataSources: ExpressionDataSources = {
          ...getExpressionDataSourcesMock(),
          formDataSelector: (path) => dot.pick(path, dataModel ?? {}),
          attachmentsSelector: (node) => attachments[node.getId()] ?? [],
          instanceDataSources: buildInstanceDataSources(instance),
          applicationSettings: frontendSettings || ({} as IApplicationSettings),
          authContext: buildAuthContext(permissions),
        };

        const foundContexts: SharedTestContextList[] = [];
        const _layouts = layouts || {};
        for (const key of Object.keys(_layouts)) {
          const layout = generateHierarchy(_layouts[key].data.layout, dataSources, getComponentDef);

          foundContexts.push({
            component: key,
            currentLayout: key,
            // @ts-ignore
            children: layout.children().map((child) => recurse(child, key)),
          });
        }

        expect(foundContexts.sort(contextSorter)).toEqual(expectedContexts.sort(contextSorter));
      },
    );
  });
});
