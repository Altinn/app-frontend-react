import { getExpressionDataSourcesMock } from 'src/__mocks__/getExpressionDataSourcesMock';
import { convertInstanceDataToAttachments, getSharedTests } from 'src/features/expressions/shared';
import { getComponentDef } from 'src/layout';
import { buildAuthContext } from 'src/utils/authContext';
import { buildInstanceDataSources } from 'src/utils/instanceDataSources';
import { generateHierarchy } from 'src/utils/layout/HierarchyGenerator';
import { splitDashedKey } from 'src/utils/splitDashedKey';
import type { ExpressionDataSources } from 'src/features/expressions/ExprContext';
import type { SharedTestContext, SharedTestContextList } from 'src/features/expressions/shared';
import type { IApplicationSettings } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

describe('Expressions shared context tests', () => {
  const sharedTests = getSharedTests('context-lists');

  function contextSorter(a: SharedTestContext, b: SharedTestContext): -1 | 0 | 1 {
    if (a.component === b.component) {
      return 0;
    }

    return a.component > b.component ? 1 : -1;
  }

  function recurse(node: LayoutNode, key: string): SharedTestContextList {
    const splitKey = splitDashedKey(node.id);
    const context: SharedTestContextList = {
      component: splitKey.baseComponentId,
      currentLayout: key,
    };
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
          attachmentsSelector: (node) => attachments[node.id] ?? [],
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
            children: layout.children().map((child) => recurse(child, key)),
          });
        }

        expect(foundContexts.sort(contextSorter)).toEqual(expectedContexts.sort(contextSorter));
      },
    );
  });
});
