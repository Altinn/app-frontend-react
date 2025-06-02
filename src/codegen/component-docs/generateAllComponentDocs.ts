import fs from 'fs/promises';

import { markdownCode, markdownTable } from 'src/codegen/component-docs/markdown';
import { saveFile } from 'src/codegen/tools';
import type { ComponentProperty, PropList, PropObjectProperties } from 'src/codegen/types';

interface TableRow {
  name: string;
  type: string;
  description: string;
}

export function generateAllComponentDocs(propList: PropList, folder: string): Promise<unknown>[] {
  const promises: Promise<unknown>[] = [];

  for (const compType of Object.keys(propList)) {
    const properties = propList[compType] as PropObjectProperties;
    const fullPath = `${folder}/${compType}.md`;
    promises.push(generateComponentDocs(properties, fullPath));
  }

  return promises;
}

async function generateComponentDocs(properties: PropObjectProperties, fullPath: string): Promise<unknown> {
  const tableRows: TableRow[] = [];
  for (const propName of Object.keys(properties)) {
    const property = properties[propName] as ComponentProperty;
    tableRows.push({
      name: markdownCode(propName),
      type: markdownCode(property.type),
      description: 'TODO',
    });
  }

  const fileExisted = await fs
    .access(fullPath)
    .then(() => true)
    .catch(() => false);

  return saveFile(fullPath, markdownTable(tableRows), undefined, fileExisted);
}
