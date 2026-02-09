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
import { findHiddenSources, isHidden } from 'src/utils/layout/hidden';
import type { ExprPositionalArgs, ExprValueArgs } from 'src/features/expressions/types';
import type { LayoutLookups } from 'src/features/form/layout/makeLayoutLookups';
import type { TextResourceMap } from 'src/features/language/textResources';
import type { IUseLanguage, TextResourceVariablesDataSources } from 'src/features/language/useLanguage';
import type { FormDataSelectorLax } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { IDataModelBindings, ILayoutCollection, ILayouts } from 'src/layout/layout';
import type { IHiddenLayoutsExternal } from 'src/types';
import type { IData, IProcess } from 'src/types/shared';
import type { ExpressionDataSources } from 'src/utils/layout/useExpressionDataSources';

const DEFAULT_DATA_TYPE = 'default';

const DEFAULT_LAYOUTS: ILayoutCollection = {
  default: {
    data: {
      layout: [
        {
          id: 'default',
          type: 'Input',
          dataModelBindings: {
            simpleBinding: { dataType: DEFAULT_DATA_TYPE, field: 'mockField' },
          },
        },
      ],
    },
  },
};

function convertAndCleanLayouts(layouts: ILayoutCollection): ILayouts {
  const result: ILayouts = {};
  for (const [pageKey, pageData] of Object.entries(layouts)) {
    result[pageKey] = cleanLayout(pageData.data.layout, DEFAULT_DATA_TYPE);
  }
  return result;
}

function extractHiddenPages(layouts: ILayoutCollection): IHiddenLayoutsExternal {
  const hiddenPages: IHiddenLayoutsExternal = {};
  for (const [pageKey, pageData] of Object.entries(layouts)) {
    if (pageData.data.hidden !== undefined) {
      hiddenPages[pageKey] = pageData.data.hidden;
    }
  }
  return hiddenPages;
}

/**
 * Find IDs of repeating parent components for a given component
 */
function findRepeatingParentIds(componentId: string, layoutLookups: LayoutLookups): string[] {
  const parentIds: string[] = [];
  let currentParent = layoutLookups.componentToParent[componentId];
  while (currentParent && currentParent.type === 'node') {
    const parentComponent = layoutLookups.getComponent(currentParent.id);
    if (isRepeatingComponent(parentComponent)) {
      parentIds.push(parentComponent.id);
    }
    currentParent = layoutLookups.componentToParent[currentParent.id];
  }
  return parentIds;
}

/**
 * Build data model field path from repeating parent bindings and row indices
 */
function buildFieldPath(parentIds: string[], rowIndices: number[], layoutLookups: LayoutLookups): string | undefined {
  const fieldSegments: string[] = [];

  for (let level = 0; level < rowIndices.length; level++) {
    const parentId = parentIds[parentIds.length - 1 - level]; // Outermost parent first
    const component = layoutLookups.getComponent(parentId);
    const bindings = component.dataModelBindings as IDataModelBindings<RepeatingComponents>;
    const groupBinding = getRepeatingBinding(component.type as RepeatingComponents, bindings);
    if (!groupBinding) {
      return undefined;
    }

    const currentPath = fieldSegments.join('.');
    let segmentName = groupBinding.field;
    if (currentPath) {
      const currentFieldPath = currentPath.replace(/\[\d+]/g, '');
      if (segmentName.startsWith(`${currentFieldPath}.`)) {
        segmentName = segmentName.substring(currentFieldPath.length + 1);
      }
    }

    fieldSegments.push(`${segmentName}[${rowIndices[level]}]`);
  }

  return fieldSegments.join('.');
}

/**
 * Build data model path for a component given row indices.
 * When requireExactMatch is true, throws if the number of indices doesn't match the number of repeating parents.
 */
function buildDataModelPath(
  componentId: string,
  rowIndices: number[] | undefined,
  layoutLookups: LayoutLookups,
  requireExactMatch: boolean,
): IDataModelReference | undefined {
  if (!rowIndices || rowIndices.length === 0) {
    return undefined;
  }

  const parentIds = findRepeatingParentIds(componentId, layoutLookups);
  if (parentIds.length === 0) {
    return undefined;
  }

  if (requireExactMatch && parentIds.length !== rowIndices.length) {
    throw new Error(
      `Component '${componentId}' has ${parentIds.length} repeating parents, but rowIndices has ${rowIndices.length} indices.`,
    );
  }

  const indicesToUse = rowIndices.slice(0, parentIds.length);
  const field = buildFieldPath(parentIds, indicesToUse, layoutLookups);
  if (!field) {
    return undefined;
  }

  return { dataType: DEFAULT_DATA_TYPE, field };
}

/**
 * Find all component IDs referenced by 'component' or 'displayValue' functions in expressions
 */
function findComponentReferences(expressions: unknown[]): string[] {
  const refs = new Set<string>();

  function traverse(expr: unknown): void {
    if (!Array.isArray(expr)) {
      return;
    }
    const [fn, arg] = expr;
    if ((fn === 'component' || fn === 'displayValue') && typeof arg === 'string') {
      refs.add(arg);
    }
    for (const item of expr) {
      traverse(item);
    }
  }

  for (const expr of expressions) {
    traverse(expr);
  }
  return [...refs];
}

function computeHiddenComponents(
  componentIds: string[],
  layoutLookups: LayoutLookups,
  hiddenPages: IHiddenLayoutsExternal,
  rowIndices: number[] | undefined,
  partialDataSources: Omit<ExpressionDataSources, 'hiddenComponents'>,
): Record<string, boolean | undefined> {
  const baseDataSources: ExpressionDataSources = { ...partialDataSources, hiddenComponents: {} };
  const result: Record<string, boolean | undefined> = {};

  for (const componentId of componentIds) {
    if (!layoutLookups.allComponents[componentId]) {
      continue;
    }

    const sources = findHiddenSources(componentId, layoutLookups, hiddenPages);
    if (sources.length === 0) {
      result[componentId] = false;
      continue;
    }

    const dataSources: ExpressionDataSources = {
      ...baseDataSources,
      currentDataModelPath: buildDataModelPath(componentId, rowIndices, layoutLookups, false),
    };

    const { hidden } = isHidden({
      hiddenSources: sources.reverse(),
      dataSources,
      hiddenByRules: false,
      pageOrder: [],
      pageKey: layoutLookups.componentToPage[componentId],
    });

    result[componentId] = hidden;
  }

  return result;
}

function buildProcess(test: FunctionTest): IProcess | undefined {
  if (test.process) {
    return test.process;
  }
  if (test.permissions) {
    return getProcessDataMock((p) => {
      for (const key of Object.keys(test.permissions!)) {
        p.currentTask![key] = test.permissions![key];
      }
    });
  }
  return undefined;
}

function buildFormDataSelector(test: FunctionTest): FormDataSelectorLax {
  return (reference: IDataModelReference) => {
    const model = test.dataModels?.find((dm) => dm.dataElement.dataType === reference.dataType);
    if (model) {
      return dot.pick(reference.field, model.data);
    }
    if (test.dataModel && reference.dataType === DEFAULT_DATA_TYPE) {
      return dot.pick(reference.field, test.dataModel);
    }
    return ContextNotProvided;
  };
}

function buildDataModelNames(test: FunctionTest): string[] {
  const names = test.dataModels?.map((dm) => dm.dataElement.dataType) ?? [];
  if (!names.includes(DEFAULT_DATA_TYPE)) {
    names.push(DEFAULT_DATA_TYPE);
  }
  return names;
}

function buildTextResourcesMap(test: FunctionTest): TextResourceMap {
  const map: TextResourceMap = {};
  for (const resource of test.textResources ?? []) {
    map[resource.id] = { value: resource.value, variables: resource.variables };
  }
  return map;
}

function buildDataModelReaders(test: FunctionTest): DataModelReaders {
  const readerMap: Record<string, DataModelReader> = {};
  for (const dm of test.dataModels ?? []) {
    readerMap[dm.dataElement.dataType] = new DataModelReader(dm.dataElement.dataType, dm.data as object, 'loaded');
  }
  if (test.dataModel) {
    readerMap[DEFAULT_DATA_TYPE] = new DataModelReader(DEFAULT_DATA_TYPE, test.dataModel as object, 'loaded');
  }
  return new DataModelReaders(readerMap);
}

function buildDataElementSelector(test: FunctionTest): <U>(select: (data: IData[]) => U) => U | undefined {
  return <U>(select: (data: IData[]) => U): U | undefined => {
    const elements: IData[] = [
      ...(test.instanceDataElements ?? []),
      ...(test.dataModels?.map((dm) => dm.dataElement) ?? []),
    ];
    return elements.length > 0 ? select(elements) : undefined;
  };
}

function collectExpressions(test: FunctionTest): unknown[] {
  const expressions: unknown[] = [test.expression];
  for (const tc of test.testCases ?? []) {
    expressions.push(tc.expression);
  }
  return expressions;
}

function buildExpressionDataSources(test: FunctionTest): ExpressionDataSources {
  const rawLayouts = test.layouts ?? DEFAULT_LAYOUTS;
  const layouts = convertAndCleanLayouts(rawLayouts);
  const layoutLookups = makeLayoutLookups(layouts);

  const instanceDataSources = test.instance
    ? buildInstanceDataSources(test.instance, test.instance.instanceOwner?.party)
    : null;

  const formDataSelector = buildFormDataSelector(test);
  const dataModelNames = buildDataModelNames(test);
  const textResourcesMap = buildTextResourcesMap(test);
  const dataModelReaders = buildDataModelReaders(test);

  const textResourceDataSources: TextResourceVariablesDataSources = {
    applicationSettings: test.frontendSettings ?? null,
    instanceDataSources,
    customTextParameters: null,
    dataModelPath: undefined,
    dataModels: dataModelReaders,
    defaultDataType: DEFAULT_DATA_TYPE,
    formDataTypes: dataModelNames,
    formDataSelector: formDataSelector as unknown as TextResourceVariablesDataSources['formDataSelector'],
  };

  const currentLanguage = test.profileSettings?.language ?? 'nb';
  const langToolsSelector = (dataModelPath: IDataModelReference | undefined): IUseLanguage =>
    staticUseLanguage(textResourcesMap, null, currentLanguage, { ...textResourceDataSources, dataModelPath });

  const codeListSelector = (codeListId: string) =>
    test.codeLists?.[codeListId] ? castOptionsToStrings(test.codeLists[codeListId]) : undefined;

  const currentDataModelPath = test.context
    ? buildDataModelPath(test.context.component, test.context.rowIndices, layoutLookups, true)
    : undefined;

  const partialDataSources: Omit<ExpressionDataSources, 'hiddenComponents'> = {
    process: buildProcess(test),
    instanceDataSources,
    applicationSettings: test.frontendSettings ?? null,
    dataElementSelector: buildDataElementSelector(test),
    dataModelNames,
    formDataSelector,
    attachmentsSelector: () => [],
    langToolsSelector,
    currentLanguage,
    defaultDataType: DEFAULT_DATA_TYPE,
    externalApis: test.externalApis ?? { data: {}, errors: {} },
    currentDataModelPath,
    codeListSelector,
    layoutLookups,
    displayValues: {},
    currentPage: test.context?.currentLayout ?? 'FormLayout',
  };

  const componentRefs = findComponentReferences(collectExpressions(test));
  const hiddenPages = extractHiddenPages(rawLayouts);
  const hiddenComponents = computeHiddenComponents(
    componentRefs,
    layoutLookups,
    hiddenPages,
    test.context?.rowIndices,
    partialDataSources,
  );

  return { ...partialDataSources, hiddenComponents };
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
