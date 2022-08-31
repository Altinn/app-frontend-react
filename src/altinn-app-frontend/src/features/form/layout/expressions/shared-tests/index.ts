import fs from 'node:fs';

import type { ILayouts } from 'src/features/form/layout';
import type { ILayoutExpression } from 'src/features/form/layout/expressions/types';

import type {
  IApplicationSettings,
  IInstanceContext,
} from 'altinn-shared/types';

export interface TestDescription {
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

export function getSharedTests(): { [folder: string]: TestDescription[] } {
  const ignoredFiles = ['index.test.ts', 'README.md', 'index.ts'];
  const folders = fs
    .readdirSync(__dirname)
    .filter((name) => !ignoredFiles.includes(name));

  const out = {};

  for (const folder of folders) {
    out[folder] = fs
      .readdirSync(`${__dirname}/${folder}`)
      .filter((f) => f.endsWith('.json'))
      .map((f) => fs.readFileSync(`${__dirname}/${folder}/${f}`))
      .map((testJson) => JSON.parse(testJson.toString()) as TestDescription);
  }

  return out;
}
