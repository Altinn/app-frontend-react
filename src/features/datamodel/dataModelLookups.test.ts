import { Draft07 } from 'json-schema-library';
import fs from 'node:fs';
import type { JSONError, JSONSchema } from 'json-schema-library';

import { getHierarchyDataSourcesMock } from 'src/__mocks__/hierarchyMock';
import { getLayoutComponentObject } from 'src/layout';
import {
  ensureAppsDirIsSet,
  generateSimpleRepeatingGroups,
  getAllLayoutSetsWithDataModelSchema,
  parseJsonTolerantly,
} from 'src/test/allApps';
import { generateEntireHierarchy } from 'src/utils/layout/HierarchyGenerator';
import { getRootElementPath } from 'src/utils/schemaUtils';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

describe('Data model lookups in real apps', () => {
  const dir = ensureAppsDirIsSet();
  if (!dir) {
    return;
  }

  const all = getAllLayoutSetsWithDataModelSchema(dir);
  const { out: allLayoutSets, notFound } = all;
  it.each(allLayoutSets)('$appName/$setName', ({ layouts, modelPath }) => {
    const firstKey = Object.keys(layouts)[0];
    const repeatingGroups = generateSimpleRepeatingGroups(layouts);
    const nodes = generateEntireHierarchy(
      layouts,
      firstKey,
      repeatingGroups,
      getHierarchyDataSourcesMock(),
      getLayoutComponentObject,
    );

    const schema = parseJsonTolerantly(fs.readFileSync(modelPath, 'utf-8'));
    const rootPath = getRootElementPath(schema);
    const schemaCopy = structuredClone(schema);
    if (rootPath) {
      (schemaCopy as any).$ref = rootPath;
    }

    const draft = new Draft07(schemaCopy);
    const failures: any[] = [];

    for (const [pageKey, layout] of Object.entries(nodes.all())) {
      for (const node of layout.flat(true)) {
        const dataModelBindings = ('dataModelBindings' in node.item ? node.item.dataModelBindings || {} : {}) as any;
        for (const [bindingKey, binding] of Object.entries(dataModelBindings)) {
          if (!binding || typeof binding !== 'string') {
            continue;
          }

          // Converts dot-notation to JsonPointer (including support for repeating groups)
          const schemaPath = `/${binding.replace(/\./g, '/')}`.replace(/\[(\d+)]\//g, (...a) => `/${a[1]}/`);
          const readablePath = `${pageKey}/${node.item.id}/${bindingKey}`;

          try {
            const bindingSchema = draft.getSchema(schemaPath);

            if (bindingSchema?.type === 'error') {
              failures.push({ error: 'Error type', message: bindingSchema.message, readablePath, schemaPath });
            } else if (bindingSchema) {
              if (!isValidBinding(bindingSchema, node, bindingKey)) {
                failures.push({ error: 'Wrong type', type: bindingSchema.type, readablePath });
              }
            } else {
              failures.push({
                error: `Cannot locate schema for '${binding}' in '${readablePath}' (undefined)`,
                readablePath,
                schemaPath,
              });
            }
          } catch (e) {
            failures.push({
              error: e instanceof Error ? e.message : e,
              readablePath,
              schemaPath,
            });
          }
        }
      }
    }

    expect(JSON.stringify(failures, null, 2)).toEqual('[]');
  });

  it('expected to find data model schema for all apps/sets (do not expect this to pass, broken apps exist)', () => {
    expect(notFound).toEqual([]);
  });
});

function isValidBinding(schema: JSONSchema | JSONError, node: LayoutNode, bindingKey: string) {
  if (node.isType('Group') && (node.isRepGroup() || node.isRepGroupLikert()) && schema.type === 'array') {
    return true;
  }
  if (
    node.isType('Group') &&
    (node.isNonRepGroup() || node.isNonRepPanelGroup()) &&
    (schema.type === 'object' || schema.type === undefined)
  ) {
    return true;
  }

  if (
    (node.isType('FileUpload') || node.isType('FileUploadWithTag')) &&
    bindingKey === 'list' &&
    schema.type === 'array'
  ) {
    return true;
  }

  const isSimpleType =
    schema.type === 'string' || schema.type === 'number' || schema.type === 'integer' || schema.type === 'boolean';

  if ((node.isType('List') || node.isType('AddressComponent')) && isSimpleType) {
    return true;
  }

  // eslint-disable-next-line sonarjs/prefer-single-boolean-return
  if (bindingKey === 'simpleBinding' && isSimpleType) {
    return true;
  }

  return false;
}
