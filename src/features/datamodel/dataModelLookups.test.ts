import fs from 'node:fs';
import type { JSONSchema7 } from 'json-schema';

import { getHierarchyDataSourcesMock } from 'src/__mocks__/hierarchyMock';
import { dotNotationToPointer } from 'src/features/datamodel/notations';
import { lookupBindingInSchema } from 'src/features/datamodel/SimpleSchemaTraversal';
import { prepareMetaData } from 'src/features/datamodel/useCurrentDataModelMetaDataQuery';
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
  it.each(allLayoutSets)('$appName/$setName', ({ layouts, modelPath, metaDataPath }) => {
    if (!modelPath) {
      return;
    }

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
    const metaData = metaDataPath ? parseJsonTolerantly(fs.readFileSync(metaDataPath, 'utf-8')) : {};
    const rootPath = getRootElementPath(schema);
    const failures: any[] = [];
    const metaDataElements = prepareMetaData(metaData.elements ?? metaData.Elements ?? {});

    for (const [pageKey, layout] of Object.entries(nodes.all())) {
      for (const node of layout.flat(true)) {
        const dataModelBindings = ('dataModelBindings' in node.item ? node.item.dataModelBindings || {} : {}) as any;
        for (const [bindingKey, binding] of Object.entries(dataModelBindings)) {
          if (!binding || typeof binding !== 'string') {
            continue;
          }

          const schemaPath = dotNotationToPointer(binding);
          const readablePath = `${pageKey}/${node.item.id}/${bindingKey}`;

          const [result, error] = lookupBindingInSchema({
            schema,
            bindingPointer: schemaPath,
            rootElementPath: rootPath,
            metaDataElements,
          });

          if (error) {
            failures.push({ ...error, readablePath, schemaPath });
          } else if (!isValidBinding(result, node, bindingKey)) {
            failures.push({ error: 'Wrong type', type: result.type, readablePath, schemaPath });
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

function typeIsSimple(type: string | string[] | undefined) {
  return type === 'string' || type === 'number' || type === 'integer' || type === 'boolean';
}

function isValidBinding(schema: JSONSchema7, node: LayoutNode, bindingKey: string) {
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

  const isSimpleType = typeIsSimple(schema.type);
  if ((node.isType('List') || node.isType('AddressComponent')) && isSimpleType) {
    return true;
  }

  // eslint-disable-next-line sonarjs/prefer-single-boolean-return
  if (bindingKey === 'simpleBinding' && isSimpleType) {
    return true;
  }

  return false;
}
