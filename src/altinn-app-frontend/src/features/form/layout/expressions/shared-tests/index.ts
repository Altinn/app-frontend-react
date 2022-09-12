import fs from 'node:fs';

import type { ILayout } from 'src/features/form/layout';
import type { LayoutExpression } from 'src/features/form/layout/expressions/types';

import type {
  IApplicationSettings,
  IInstanceContext,
} from 'altinn-shared/types';

export interface TestDescription {
  name: string;
  expression: LayoutExpression;
  expects?: any;
  expectsFailure?: string;
  context?: {
    component?: string;
    rowIndices?: number[];
    currentLayout?: string;
  };
  layouts?: {
    [key: string]: {
      $schema: string;
      data: {
        layout: ILayout;
      };
    };
  };
  dataModel?: any;
  instanceContext?: IInstanceContext;
  frontendSettings?: IApplicationSettings;
}

export function getSharedTests(): { [folder: string]: TestDescription[] } {
  const folders = fs
    .readdirSync(__dirname)
    .filter((name) => fs.statSync(`${__dirname}/${name}`).isDirectory());

  const out = {};

  for (const folder of folders) {
    out[folder] = fs
      .readdirSync(`${__dirname}/${folder}`)
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const testJson = fs.readFileSync(`${__dirname}/${folder}/${f}`);
        const test = JSON.parse(testJson.toString()) as TestDescription;
        test.name += ` (${f})`;

        return test;
      });
  }

  return out;
}
