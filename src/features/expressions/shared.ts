import fs from 'node:fs';

import type { IAttachments, UploadedAttachment } from 'src/features/attachments';
import type { Expression } from 'src/features/expressions/types';
import type { IRawTextResource } from 'src/features/language/textResources';
import type { ILayout, ILayouts } from 'src/layout/layout';
import type { IApplicationSettings, IData, IInstance, IProcess, ITask } from 'src/types/shared';

export interface Layouts {
  [key: string]: {
    $schema: string;
    data: {
      hidden?: Expression;
      layout: ILayout;
    };
  };
}

export type DataModelAndElement = {
  dataElement: IData;
  data: any;
};

/**
 * TODO(Datamodels): dataModel is the default data model, which is still a concept.
 * So maybe add an extra field like extraDataModels or additionalDataModels or something
 * to be able to test expressions on multiple data models?
 */
export interface SharedTest {
  name: string;
  disabledFrontend?: boolean;
  layouts?: Layouts;
  dataModel?: any;
  dataModels?: DataModelAndElement[];
  instance?: IInstance;
  process?: IProcess;
  instanceDataElements?: IData[];
  permissions?: ITask;
  frontendSettings?: IApplicationSettings;
  textResources?: IRawTextResource[];
  profileSettings?: {
    language?: string;
  };
}

export interface SharedTestContext {
  component: string;
  currentLayout: string;
}

export interface SharedTestFunctionContext extends SharedTestContext {
  rowIndices?: number[];
}

export interface SharedTestContextList extends SharedTestFunctionContext {
  children?: SharedTestContext[];
}

export interface ContextTest extends SharedTest {
  expectedContexts: SharedTestContextList[];
}

export interface FunctionTest extends SharedTest {
  expression: Expression;
  expects?: any;
  expectsFailure?: string;
  context?: SharedTestFunctionContext;
}

export interface LayoutPreprocessorTest {
  name: string;
  layouts: Layouts;
  expects: Layouts;
  expectsWarnings?: string[];
}

interface TestFolder<T> {
  folderName: string;
  content: T[];
}

interface TestFolders {
  'context-lists': TestFolder<TestFolder<ContextTest>>;
  functions: TestFolder<TestFolder<FunctionTest>>;
  invalid: TestFolder<FunctionTest>;
  'layout-preprocessor': TestFolder<LayoutPreprocessorTest>;
}

export function getSharedTests<Folder extends keyof TestFolders>(
  subPath: Folder,
  parentPath = '',
): TestFolders[Folder] {
  const out: TestFolder<any> = {
    folderName: subPath,
    content: [],
  };
  const fullPath = `${__dirname}/shared-tests/${parentPath}/${subPath}`;

  fs.readdirSync(fullPath).forEach((name) => {
    const isDir = fs.statSync(`${fullPath}/${name}`).isDirectory();
    if (isDir) {
      out.content.push(getSharedTests(name as keyof TestFolders, `${parentPath}/${subPath}`));
    } else if (name.endsWith('.json')) {
      const testJson = fs.readFileSync(`${fullPath}/${name}`);
      const test = JSON.parse(testJson.toString());
      test.name += ` (${name})`;
      out.content.push(test);
    }
  });

  return out;
}

export function convertLayouts(input: Layouts | undefined): ILayouts {
  const _layouts: ILayouts = {};
  for (const key of Object.keys(input || {})) {
    _layouts[key] = (input || {})[key]?.data.layout;
  }

  return _layouts;
}

export function convertInstanceDataToAttachments(instanceData: IData[] | undefined): IAttachments<UploadedAttachment> {
  const out: IAttachments<UploadedAttachment> = {};
  if (instanceData) {
    for (const data of instanceData) {
      const component = out[data.dataType] || [];
      component.push({
        updating: false,
        deleting: false,
        uploaded: true,
        data,
      });

      out[data.dataType] = component;
    }
  }

  return out;
}
