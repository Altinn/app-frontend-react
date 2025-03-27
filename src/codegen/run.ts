import fs from 'node:fs/promises';
import path from 'node:path';

import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';
import { generateAllCommonTypes, generateCommonTypeScript } from 'src/codegen/Common';
import { LayoutSchemaV1 } from 'src/codegen/schemas/layout.schema.v1';
import { LayoutSetsSchemaV1 } from 'src/codegen/schemas/layout-sets.schema.v1';
import { LayoutSettingsSchemaV1 } from 'src/codegen/schemas/layoutSettings.schema.v1';
import { saveFile, saveTsFile } from 'src/codegen/tools';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { SchemaFileProps } from 'src/codegen/SchemaFile';

type ComponentList = { [folder: string]: string };

async function getComponentList(): Promise<[ComponentList, string[]]> {
  const toDelete: string[] = [];
  const out: ComponentList = {};
  const files = await fs.readdir('src/layout');
  for (const file of files) {
    const stat = await fs.stat(path.join('src/layout', file));
    if (!stat.isDirectory()) {
      continue;
    }

    const filesInside = (await fs.readdir(path.join('src/layout', file))).filter((f) => !f.includes('.generated.'));
    if (filesInside.length === 0) {
      toDelete.push(file);
      continue;
    }

    out[file] = file;
  }

  return [out, toDelete];
}

(async () => {
  const [componentList, toDelete] = await getComponentList();

  for (const emptyFolder of toDelete) {
    console.log(`Deleting empty folder src/layout/${emptyFolder}`);
    await fs.rm(path.join('src/layout', emptyFolder), { recursive: true });
  }

  const sortedKeys = Object.keys(componentList).sort((a, b) => a.localeCompare(b));
  const componentIndex = [
    '// This file is generated by running `yarn gen`',
    '',
    ...sortedKeys.map((key) => `import { getConfig as get${key}Config } from 'src/layout/${key}/config.generated';`),
    ...sortedKeys.map(
      (key) => `import type { TypeConfig as ${key}TypeConfig } from 'src/layout/${key}/config.generated';`,
    ),
    '',
    `export function createComponentConfigs() {`,
    `  return {`,
    ...sortedKeys.map((key) => `    ${componentList[key]}: get${key}Config(),`),
    `  };`,
    `}`,
    '',
    `let componentConfigs: ReturnType<typeof createComponentConfigs> | null = null;`,
    `export function getComponentConfigs() {`,
    `  return componentConfigs ?? (componentConfigs = createComponentConfigs());`,
    `}`,
    '',
    `export type ComponentTypeConfigs = {`,
    ...sortedKeys.map((key) => `  ${componentList[key]}: ${key}TypeConfig;`),
    `};`,
  ];

  const promises: Promise<void>[] = [];
  promises.push(saveFile('src/layout/components.generated.ts', componentIndex.join('\n')));

  // Make sure all common types has been generated first, so that they don't start extending
  // each other after being frozen
  generateAllCommonTypes();

  const configMap: { [key: string]: ComponentConfig } = {};
  for (const key of sortedKeys) {
    const tsPathConfig = `src/layout/${key}/config.generated.ts`;
    const tsPathDef = `src/layout/${key}/config.def.generated.tsx`;

    const config = await CodeGeneratorContext.generateTypeScript(tsPathConfig, () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const config = require(`src/layout/${key}/config`).Config;
      config.setType(componentList[key], key);
      configMap[key] = config;
      return config.generateConfigFile();
    });
    const defClass = await CodeGeneratorContext.generateTypeScript(tsPathDef, () => {
      const def = configMap[key].generateDefClass();
      return `import React from 'react';\n\n${def}`;
    });

    promises.push(saveTsFile(tsPathConfig, config));
    promises.push(saveTsFile(tsPathDef, defClass));
  }

  const schemaProps: SchemaFileProps = { configMap, componentList, sortedKeys };
  const schemas = [
    new LayoutSchemaV1(schemaProps),
    new LayoutSetsSchemaV1(schemaProps),
    new LayoutSettingsSchemaV1(schemaProps),
  ];

  const schemaPathBase = 'schemas/json/';
  for (const file of schemas) {
    const schemaPath = schemaPathBase + file.getFileName();
    const schema = await CodeGeneratorContext.generateJsonSchema(schemaPathBase, file);
    promises.push(saveFile(schemaPath, JSON.stringify(schema.result, null, 2)));
  }

  const commonTsPath = 'src/layout/common.generated.ts';
  promises.push(
    saveTsFile(
      commonTsPath,
      CodeGeneratorContext.generateTypeScript(commonTsPath, () => {
        generateCommonTypeScript();
        return ''; // Empty content, because all symbols are exported and registered in the context
      }),
    ),
  );

  await Promise.all(promises);
})();
