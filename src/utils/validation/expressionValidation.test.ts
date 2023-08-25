import dot from 'dot-object';
import fs from 'node:fs';

import { getHierarchyDataSourcesMock } from 'src/__mocks__/hierarchyMock';
import { staticUseLanguageForTests } from 'src/hooks/useLanguage';
import { buildAuthContext } from 'src/utils/authContext';
import { getRepeatingGroups } from 'src/utils/formLayout';
import { buildInstanceContext } from 'src/utils/instanceContext';
import { _private } from 'src/utils/layout/hierarchy';
import {
  resolveExpressionValidationConfig,
  runExpressionValidationsOnNode,
} from 'src/utils/validation/expressionValidation';
import type { ILayout } from 'src/layout/layout';
import type { IApplicationSettings } from 'src/types/shared';
import type { HierarchyDataSources } from 'src/utils/layout/hierarchy.types';
import type {
  IExpressionValidationConfig,
  IValidationContext,
  IValidationMessage,
  ValidationSeverity,
} from 'src/utils/validation/types';

const { resolvedNodesInLayouts } = _private;

type ExpressionValidationTest = {
  name: string;
  expects: {
    message: string;
    severity: string;
    field: string;
    componentId: string;
  }[];
  validationConfig: IExpressionValidationConfig;
  formData: object;
  layout: ILayout;
};

function getSharedTests() {
  const fullPath = `${__dirname}/shared-expression-validation-tests`;
  const out: ExpressionValidationTest[] = [];
  fs.readdirSync(fullPath).forEach((name) => {
    if (name.endsWith('.json')) {
      const testJson = fs.readFileSync(`${fullPath}/${name}`);
      const test = JSON.parse(testJson.toString());
      test.name += ` (${name})`;
      out.push(test);
    }
  });

  return out;
}

describe('Expression validation shared tests', () => {
  const sharedTests = getSharedTests();
  it.each(sharedTests)('$name', ({ name, expects, validationConfig, formData, layout }) => {
    const langTools = staticUseLanguageForTests({
      textResources: [],
    });
    const dataSources: HierarchyDataSources = {
      ...getHierarchyDataSourcesMock(),
      formData: dot.dot(formData),
      attachments: {},
      instanceContext: buildInstanceContext(),
      applicationSettings: {} as IApplicationSettings,
      authContext: buildAuthContext(undefined),
      langTools,
    };

    const customValidation = resolveExpressionValidationConfig(validationConfig);

    const validationContext = {
      customValidation,
      langTools,
    } as any as IValidationContext;

    const repeatingGroups = getRepeatingGroups(layout, dataSources.formData);
    const currentLayout = 'page';
    const rootCollection = resolvedNodesInLayouts(
      { [currentLayout]: layout },
      currentLayout,
      repeatingGroups,
      dataSources,
    );

    const nodes = rootCollection.allNodes();
    const validationObjects: IValidationMessage<ValidationSeverity>[] = [];
    for (const node of nodes) {
      const result = runExpressionValidationsOnNode(node, validationContext);
      validationObjects.push(...(result as IValidationMessage<ValidationSeverity>[]));
    }

    expect(validationObjects.length).toEqual(expects.length);
    for (const validationObject of validationObjects) {
      const expected = expects.find(
        (expected) =>
          expected.message === validationObject.message &&
          expected.severity === validationObject.severity &&
          expected.componentId === validationObject.componentId,
      );
      expect(expected).toBeDefined();
    }
  });
});
