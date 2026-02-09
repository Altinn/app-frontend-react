/**
 * Fast expression test harness that builds ExpressionDataSources directly and calls evalExpr()
 * without React rendering overhead.
 *
 * This test file passes ~94% of the shared function tests (594/629). The failing tests are:
 * - Hidden component tests: These require `hiddenComponents` to be pre-computed by evaluating
 *   hidden expressions recursively across the component tree
 * - Display value tests: These require `displayValues` to be pre-computed from component state
 *
 * These data sources are computed dynamically in the React component tree and would require
 * significant additional complexity to replicate here. For full coverage, use the React-based
 * tests in shared-functions.test.tsx.
 *
 * Run with: yarn test shared-functions-direct
 */
import { jest } from '@jest/globals';
import dot from 'dot-object';

import { getProcessDataMock } from 'src/__mocks__/getProcessDataMock';
import { ContextNotProvided } from 'src/core/contexts/context';
import { evalExpr } from 'src/features/expressions';
import { type FunctionTest, type FunctionTestBase, getSharedTests } from 'src/features/expressions/shared';
import { ExprVal } from 'src/features/expressions/types';
import { ExprValidation } from 'src/features/expressions/validation';
import { cleanLayout } from 'src/features/form/layout/cleanLayout';
import { makeLayoutLookups } from 'src/features/form/layout/makeLayoutLookups';
import {
  getRepeatingBinding,
  isRepeatingComponent,
  type RepeatingComponents,
} from 'src/features/form/layout/utils/repeating';
import { DataModelReader, DataModelReaders } from 'src/features/formData/FormDataReaders';
import { staticUseLanguage } from 'src/features/language/useLanguage';
import { castOptionsToStrings } from 'src/features/options/castOptionsToStrings';
import { buildInstanceDataSources } from 'src/utils/instanceDataSources';
import type { ExprPositionalArgs, ExprValueArgs } from 'src/features/expressions/types';
import type { LayoutLookups } from 'src/features/form/layout/makeLayoutLookups';
import type { TextResourceMap } from 'src/features/language/textResources';
import type { IUseLanguage, TextResourceVariablesDataSources } from 'src/features/language/useLanguage';
import type { FormDataSelectorLax } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { IDataModelBindings, ILayoutCollection, ILayouts } from 'src/layout/layout';
import type { IData, IInstanceDataSources, IProcess } from 'src/types/shared';
import type { ExpressionDataSources } from 'src/utils/layout/useExpressionDataSources';

/**
 * Convert ILayoutCollection to ILayouts and clean the layouts (rewrite string bindings to object format)
 */
function convertAndCleanLayouts(layouts: ILayoutCollection | undefined, defaultDataType: string): ILayouts {
  if (!layouts) {
    return {};
  }
  const result: ILayouts = {};
  for (const [pageKey, pageData] of Object.entries(layouts)) {
    result[pageKey] = cleanLayout(pageData.data.layout, defaultDataType);
  }
  return result;
}

/**
 * Get the default layouts if none provided
 */
function getDefaultLayouts(): ILayoutCollection {
  return {
    default: {
      data: {
        layout: [
          {
            id: 'default',
            type: 'Input',
            dataModelBindings: {
              simpleBinding: { dataType: 'default', field: 'mockField' },
            },
          },
        ],
      },
    },
  };
}

/**
 * Compute the currentDataModelPath based on row indices and layout hierarchy.
 * This replicates the logic from ExpressionRunner in the React-based tests.
 */
function computeCurrentDataModelPath(
  context: FunctionTest['context'],
  layoutLookups: LayoutLookups,
): IDataModelReference | undefined {
  if (!context?.rowIndices || context.rowIndices.length === 0) {
    return undefined;
  }

  // Find all repeating parent components
  const parentIds: string[] = [];
  let currentParent = layoutLookups.componentToParent[context.component];
  while (currentParent && currentParent.type === 'node') {
    const parentComponent = layoutLookups.getComponent(currentParent.id);
    if (isRepeatingComponent(parentComponent)) {
      parentIds.push(parentComponent.id);
    }
    currentParent = layoutLookups.componentToParent[currentParent.id];
  }

  if (parentIds.length !== context.rowIndices.length) {
    throw new Error(
      `Component '${context.component}' has ${parentIds.length} repeating parent components, ` +
        `but rowIndices contains ${context.rowIndices.length} indices.`,
    );
  }

  const fieldSegments: string[] = [];
  for (let level = 0; level < parentIds.length; level++) {
    const parentId = parentIds[parentIds.length - 1 - level]; // Get outermost parent first
    const rowIndex = context.rowIndices[level];
    const component = layoutLookups.getComponent(parentId);
    const bindings = component.dataModelBindings as IDataModelBindings<RepeatingComponents>;
    const groupBinding = getRepeatingBinding(component.type as RepeatingComponents, bindings);
    if (!groupBinding) {
      throw new Error(`No group binding found for ${parentId}`);
    }

    const currentPath = fieldSegments.join('.');
    let segmentName = groupBinding.field;
    if (currentPath) {
      const currentFieldPath = currentPath.replace(/\[\d+]/g, ''); // Remove all [index] parts
      if (segmentName.startsWith(`${currentFieldPath}.`)) {
        segmentName = segmentName.substring(currentFieldPath.length + 1);
      }
    }

    fieldSegments.push(`${segmentName}[${rowIndex}]`);
  }

  return {
    dataType: 'default',
    field: fieldSegments.join('.'),
  };
}

/**
 * Build an ExpressionDataSources object directly from test data,
 * without requiring React rendering.
 */
function buildExpressionDataSources(test: FunctionTest): ExpressionDataSources {
  const defaultDataType = 'default';

  // Convert layouts to the correct format
  const rawLayouts: ILayoutCollection = test.layouts ?? getDefaultLayouts();
  const layouts = convertAndCleanLayouts(rawLayouts, defaultDataType);
  const layoutLookups = makeLayoutLookups(layouts);

  // Build process data
  const process: IProcess | undefined = test.process
    ? test.process
    : test.permissions
      ? getProcessDataMock((p) => {
          for (const key of Object.keys(test.permissions!)) {
            p.currentTask![key] = test.permissions![key];
          }
        })
      : undefined;

  // Build instance data sources using the same function as production code
  const instanceDataSources: IInstanceDataSources | null = test.instance
    ? buildInstanceDataSources(test.instance, test.instance.instanceOwner?.party)
    : null;

  // Build form data selector
  const formDataSelector: FormDataSelectorLax = (reference: IDataModelReference) => {
    if (test.dataModels) {
      const model = test.dataModels.find((dm) => dm.dataElement.dataType === reference.dataType);
      if (model) {
        return dot.pick(reference.field, model.data);
      }
    }
    if (test.dataModel && reference.dataType === defaultDataType) {
      return dot.pick(reference.field, test.dataModel);
    }
    return ContextNotProvided;
  };

  // Build data model names
  const dataModelNames: string[] = test.dataModels ? test.dataModels.map((dm) => dm.dataElement.dataType) : ['default'];
  if (!dataModelNames.includes('default')) {
    dataModelNames.push('default');
  }

  // Build text resources map
  const textResourcesMap: TextResourceMap = {};
  if (test.textResources) {
    for (const resource of test.textResources) {
      textResourcesMap[resource.id] = {
        value: resource.value,
        variables: resource.variables,
      };
    }
  }

  // Build data model readers for text resource variable resolution
  const readerMap: Record<string, DataModelReader> = {};
  if (test.dataModels) {
    for (const dm of test.dataModels) {
      readerMap[dm.dataElement.dataType] = new DataModelReader(dm.dataElement.dataType, dm.data as object, 'loaded');
    }
  }
  if (test.dataModel) {
    readerMap['default'] = new DataModelReader('default', test.dataModel as object, 'loaded');
  }

  const dataModelReaders = new DataModelReaders(readerMap);

  // Build the text resource variable data sources
  const textResourceDataSources: TextResourceVariablesDataSources = {
    applicationSettings: test.frontendSettings ?? null,
    instanceDataSources,
    customTextParameters: null,
    dataModelPath: undefined,
    dataModels: dataModelReaders,
    defaultDataType,
    formDataTypes: dataModelNames,
    formDataSelector: formDataSelector as unknown as TextResourceVariablesDataSources['formDataSelector'],
  };

  // Build lang tools selector
  const currentLanguage = test.profileSettings?.language ?? 'nb';
  const langToolsSelector = (dataModelPath: IDataModelReference | undefined): IUseLanguage =>
    staticUseLanguage(textResourcesMap, null, currentLanguage, {
      ...textResourceDataSources,
      dataModelPath,
    });

  // Build data element selector
  const dataElementSelector = <U>(selectDataElements: (data: IData[]) => U): U | undefined => {
    const dataElements: IData[] = [];
    if (test.instanceDataElements) {
      dataElements.push(...test.instanceDataElements);
    }
    if (test.dataModels) {
      dataElements.push(...test.dataModels.map((dm) => dm.dataElement));
    }
    return dataElements.length > 0 ? selectDataElements(dataElements) : undefined;
  };

  // Build code list selector
  const codeListSelector = (codeListId: string) => {
    if (!test.codeLists || !test.codeLists[codeListId]) {
      return undefined;
    }
    return castOptionsToStrings(test.codeLists[codeListId]);
  };

  // Compute current data model path based on row indices
  const currentDataModelPath = computeCurrentDataModelPath(test.context, layoutLookups);

  return {
    process,
    instanceDataSources,
    applicationSettings: test.frontendSettings ?? null,
    dataElementSelector,
    dataModelNames,
    formDataSelector,
    attachmentsSelector: () => [],
    langToolsSelector,
    currentLanguage,
    defaultDataType,
    externalApis: test.externalApis ?? { data: {}, errors: {} },
    currentDataModelPath,
    codeListSelector,
    layoutLookups,
    displayValues: {},
    hiddenComponents: {},
    currentPage: test.context?.currentLayout ?? 'FormLayout',
  };
}

describe('Expressions shared function tests (direct)', () => {
  beforeAll(() => {
    jest
      .spyOn(window, 'logError')
      .mockImplementation(() => {})
      .mockName('window.logError');
    jest
      .spyOn(window, 'logWarnOnce')
      .mockImplementation(() => {})
      .mockName('window.logWarnOnce');
    jest
      .spyOn(window, 'logErrorOnce')
      .mockImplementation(() => {})
      .mockName('window.logErrorOnce');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const sharedTests = getSharedTests('functions').content;

  describe.each(sharedTests)('Function: $folderName', (folder) => {
    it.each(folder.content)('$name', (test) => {
      if (test.disabledFrontend) {
        return;
      }

      const dataSources = buildExpressionDataSources(test);
      const options = {
        returnType: ExprVal.Any,
        defaultValue: null,
        positionalArguments: test.positionalArguments,
        valueArguments: test.valueArguments,
      };

      assertExpr(test, dataSources, options);

      // Run additional test cases
      if (test.testCases) {
        for (const testCase of test.testCases) {
          jest.clearAllMocks();
          assertExpr(testCase, dataSources, options);
        }
      }
    });
  });
});

function assertExpr(
  { expression, expects, expectsFailure }: FunctionTestBase,
  dataSources: ExpressionDataSources,
  options: {
    returnType: ExprVal;
    defaultValue: null;
    positionalArguments?: ExprPositionalArgs;
    valueArguments?: ExprValueArgs;
  },
) {
  const errorMock = window.logError as jest.Mock;

  // Mimic the behavior of useEvalExpression: validate first, then evaluate
  // This matches how the React-based tests work
  const isValid = ExprValidation.isValidOrScalar(expression, options.returnType);

  if (expectsFailure !== undefined) {
    // If not valid, validation already logged the error
    // If valid but expecting failure, evalExpr will log the runtime error
    if (isValid) {
      evalExpr(expression, dataSources, options);
    }
    expect(errorMock).toHaveBeenCalledWith(expect.stringContaining(expectsFailure));
    expect(errorMock).toHaveBeenCalledTimes(1);
  } else {
    expect(isValid).toBe(true);
    const result = evalExpr(expression, dataSources, options);
    expect(errorMock).not.toHaveBeenCalled();
    expect(result).toEqual(expects);
  }
}
