import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import dotenv from 'dotenv';
import fs from 'node:fs';
import numberFormatSchema from 'schemas/json/component/number-format.schema.v1.json';
import expressionSchema from 'schemas/json/layout/expression.schema.v1.json';
import layoutSchema from 'schemas/json/layout/layout.schema.v1.json';
import layoutSchemaV2 from 'schemas/json/layout/layout.schema.v2.json';
import type { ErrorObject } from 'ajv';

import { ComponentConfigs } from 'src/layout/components';
import { getAllLayoutSets } from 'src/utils/layout/getAllLayoutSets';

describe('Layout schema', () => {
  describe('All schemas should be valid', () => {
    const recurse = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (fs.lstatSync(`${dir}/${file}`).isDirectory()) {
          recurse(`${dir}/${file}`);
          continue;
        }

        if (!file.endsWith('.json')) {
          continue;
        }

        it(`${dir}/${file} should be parseable as JSON and a valid schema`, () => {
          const content = fs.readFileSync(`${dir}/${file}`, 'utf-8');
          expect(() => JSON.parse(content)).not.toThrow();

          const schema = JSON.parse(content);
          const ajv = schema.$schema && schema.$schema.includes('2020-12') ? new Ajv2020() : new Ajv();
          expect(ajv.validateSchema(schema)).toBeTruthy();
        });
      }
    };

    recurse('schemas');
  });

  describe('All known components should have their own schema file', () => {
    const schemaDir = 'schemas/json/component';
    const oneOf = new Set(layoutSchemaV2.$defs.component.oneOf.map((schema) => schema.$ref.split('/').pop()));
    for (const component of Object.keys(ComponentConfigs)) {
      it(`${component}.schema.v1.json should exist and be referenced`, () => {
        const fileName = `${component}.schema.v1.json`;
        const fullPath = `${schemaDir}/${fileName}`;
        expect(fs.existsSync(fullPath)).toBeTruthy();
        expect(oneOf.has(fileName)).toBeTruthy();
        const content = fs.readFileSync(fullPath, 'utf-8');
        const schema = JSON.parse(content);
        expect(schema.$id).toBe(`https://altinncdn.no/schemas/json/component/${fileName}`);
        expect(schema.properties.type.const).toEqual(component);
      });
    }
  });

  describe('All known layout sets should validate against the layout schema', () => {
    const env = dotenv.config();
    const dir = env.parsed?.ALTINN_ALL_APPS_DIR;
    if (!dir) {
      it('did not find any apps', () => {
        expect(true).toBeTruthy();
      });
      console.warn(
        'ALTINN_ALL_APPS_DIR should be set, please create a .env file and point it to a directory containing all known apps',
      );
      return;
    }

    const ajv = new Ajv({
      strict: false,
      schemas: [expressionSchema, numberFormatSchema],
    });
    const validate = ajv.compile(layoutSchema);
    const allLayoutSets = getAllLayoutSets(dir);

    const ignoreSomeErrors = (errors: ErrorObject[] | null | undefined) =>
      (errors || []).filter((error) => {
        if (error.instancePath.endsWith('/id') && error.message?.startsWith('must match pattern')) {
          // Ignore errors about id not matching pattern. This is common, and we don't care that much about it.
          return false;
        }

        return !error.message?.startsWith("must have required property 'size'");
      });

    for (const { appName, setName, entireFiles } of allLayoutSets) {
      for (const layoutName of Object.keys(entireFiles)) {
        const layout = entireFiles[layoutName];
        it(`${appName}/${setName}/${layoutName}`, () => {
          validate(layout);
          expect(ignoreSomeErrors(validate.errors)).toEqual([]);
        });
      }
    }
  });
});
