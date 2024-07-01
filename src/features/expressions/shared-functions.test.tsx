import React from 'react';

import { screen } from '@testing-library/react';

import { getApplicationMetadataMock } from 'src/__mocks__/getApplicationMetadataMock';
import { getSharedTests } from 'src/features/expressions/shared';
import { ExprVal } from 'src/features/expressions/types';
import { ExprValidation } from 'src/features/expressions/validation';
import { renderWithNode } from 'src/test/renderWithProviders';
import { useEvalExpression } from 'src/utils/layout/generator/useEvalExpression';
import type { SharedTestFunctionContext } from 'src/features/expressions/shared';
import type { ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { ILayoutCollection } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

function ExpressionRunner({ node, expression }: { node: LayoutNode; expression: ExprValToActualOrExpr<ExprVal.Any> }) {
  const result = useEvalExpression(ExprVal.Any, node, expression, null);
  return (
    <>
      <div data-testid='expr-result'>{JSON.stringify(result)}</div>
    </>
  );
}

function nodeIdFromContext(context: SharedTestFunctionContext | undefined) {
  if (!context?.component) {
    return 'default';
  }
  if (context.rowIndices) {
    return `${context.component}-${context.rowIndices.join('-')}`;
  }
  return context.component;
}

const defaultLayouts: ILayoutCollection = {
  default: {
    data: {
      layout: [
        {
          id: 'default',
          type: 'Input',
          dataModelBindings: {
            simpleBinding: 'mockField',
          },
        },
      ],
    },
  },
};

describe('Expressions shared function tests', () => {
  let preHash;
  beforeAll(() => {
    preHash = window.location.hash;
    jest.spyOn(window, 'logError').mockImplementation(() => {});
  });
  afterAll(() => {
    window.location.hash = preHash;
    jest.clearAllMocks();
  });

  const sharedTests = getSharedTests('functions');

  describe.each(sharedTests.content)('Function: $folderName', (folder) => {
    it.each(folder.content)('$name', async (test) => {
      const {
        disabledFrontend,
        expression,
        expects,
        expectsFailure,
        context,
        layouts,
        dataModel,
        instanceDataElements,
        instance,
        process,
        permissions,
        frontendSettings,
        textResources,
        profileSettings,
      } = test;
      if (disabledFrontend) {
        // Skipped tests usually means that the frontend does not support the feature yet
        return;
      }

      window.location.hash = instance ? '#/instance/510001/d00ce51c-800b-416a-a906-ccab55f597e9/Task_3/grid' : '';
      const nodeId = nodeIdFromContext(context);
      await renderWithNode({
        nodeId,
        renderer: ({ node }) => (
          <ExpressionRunner
            node={node}
            expression={expression as any}
          />
        ),
        inInstance: !!instance,
        queries: {
          fetchApplicationMetadata: async () =>
            getApplicationMetadataMock(instance ? {} : { onEntry: { show: 'stateless' } }),
          fetchLayouts: async () => layouts ?? defaultLayouts,
          fetchFormData: async () => dataModel ?? {},
          ...(instance ? { fetchInstanceData: async () => instance } : {}),
          ...(process ? { fetchProcessState: async () => process } : {}),
          ...(frontendSettings ? { fetchApplicationSettings: async () => frontendSettings } : {}),
          fetchTextResources: async () => ({
            language: 'nb',
            resources: textResources || [],
          }),
        },
      });

      if (expectsFailure) {
        const mock = window.logError as jest.Mock;
        expect(mock).toHaveBeenCalledWith(expect.stringContaining(expectsFailure));
      } else {
        ExprValidation.throwIfInvalidNorScalar(expression);
        const result = JSON.parse((await screen.findByTestId('expr-result')).textContent!);
        expect(result).toEqual(expects);
      }
    });
  });
});
