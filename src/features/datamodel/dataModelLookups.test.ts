import { Draft07 } from 'json-schema-library';
import fs from 'node:fs';

import { ensureAppsDirIsSet, getAllLayoutSetsWithDataModelSchema, parseJsonTolerantly } from 'src/test/allApps';
import { getRootElementPath } from 'src/utils/schemaUtils';

describe('Data model lookups in real apps', () => {
  const dir = ensureAppsDirIsSet();
  if (!dir) {
    return;
  }

  const all = getAllLayoutSetsWithDataModelSchema(dir);
  const { out: allLayoutSets, notFound } = all;
  it.each(allLayoutSets)('$appName/$setName', ({ layouts, modelPath }) => {
    const schema = parseJsonTolerantly(fs.readFileSync(modelPath, 'utf-8'));
    const rootPath = getRootElementPath(schema);
    const schemaCopy = structuredClone(schema);
    if (rootPath) {
      (schemaCopy as any).$ref = rootPath;
    }

    const draft = new Draft07(schemaCopy);

    for (const [pageKey, layout] of Object.entries(layouts)) {
      for (const component of layout || []) {
        const dataModelBindings = ('dataModelBindings' in component ? component.dataModelBindings || {} : {}) as any;
        for (const [bindingKey, binding] of Object.entries(dataModelBindings)) {
          if (!binding || typeof binding !== 'string') {
            continue;
          }

          // Converts dot-notation to JsonPointer (including support for repeating groups)
          const schemaPath = `/${binding.replace(/\./g, '/')}`.replace(/\[(\d+)]\//g, (...a) => `/${a[1]}/`);

          try {
            const bindingSchema = draft.getSchema(schemaPath);
            const path = `${pageKey}/${component.id}/${bindingKey}`;
            if (bindingSchema?.type === 'error') {
              expect({ error: `Cannot locate schema for '${binding}' in '${path}'` }).toBeFalsy();
            } else if (bindingSchema) {
              if (component.type === 'Group') {
                expect(['array', 'object']).toContain(bindingSchema.type);
              } else {
                expect(['number', 'string']).toContain(bindingSchema.type);
              }
            } else {
              expect({ error: `Cannot locate schema for '${binding}' in '${path}'` }).toBeFalsy();
            }
          } catch (e) {
            expect({ error: e }).toBeTruthy();
          }
        }
      }
    }

    expect(true).toBeTruthy();
  });

  it('expected to find data model schema for all apps/sets', () => {
    expect(notFound).toEqual([]);
  });
});
