import fs from 'node:fs/promises';
import path from 'node:path';

import { saveFile, saveTsFile } from 'src/codegen/tools';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';

async function getComponentList() {
  const out: { [folder: string]: string } = {};
  const files = await fs.readdir('src/layout');
  for (const file of files) {
    const stat = await fs.stat(path.join('src/layout', file));
    if (stat.isDirectory()) {
      if (file === 'Address') {
        // Address is a special case, because we once named it 'AddressComponent', without any over the other components
        // having that suffix. We need to keep this for backwards compatibility, but our folder structure uses the name
        // without the suffix.
        out[file] = 'AddressComponent';
        continue;
      }

      out[file] = file;
    }
  }

  return out;
}

(async () => {
  const componentList = await getComponentList();
  const sortedKeys = Object.keys(componentList).sort((a, b) => a.localeCompare(b));
  const componentIndex = [
    '// This file is generated by running `yarn gen`',
    '',

    ...sortedKeys.map((key) => `import { Config as ${key}Config } from 'src/layout/${key}/index';`),
    ...sortedKeys.map((key) => `import type { TypeConfig as ${key}TypeConfig } from 'src/layout/${key}/index';`),
    '',
    `export const ComponentConfigs = {`,

    ...sortedKeys.map((key) => `  ${componentList[key]}: ${key}Config,`),
    `};`,
    '',
    `export type ComponentTypeConfigs = {`,

    ...sortedKeys.map((key) => `  ${componentList[key]}: ${key}TypeConfig;`),
    `};`,
  ];

  const promises: Promise<void>[] = [];
  promises.push(saveFile('src/layout/components.generated.ts', componentIndex.join('\n')));

  for (const key of sortedKeys) {
    const generator: ComponentConfig = (await import(`src/layout/${key}/config`)).Generator;
    generator.setType(componentList[key]);
    const path = `src/layout/${key}/config.generated.ts`;
    const content = generator.toTypeScript();
    promises.push(saveTsFile(path, content));
  }

  await Promise.all(promises);
})();
