import React from 'react';

import { screen } from '@testing-library/react';

import { getApplicationMetadataMock } from 'src/__mocks__/getApplicationMetadataMock';
import { getInstanceDataMock } from 'src/__mocks__/getInstanceDataMock';
import { getProcessDataMock } from 'src/__mocks__/getProcessDataMock';
import { getProfileMock } from 'src/__mocks__/getProfileMock';
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

function getDefaultLayouts(): ILayoutCollection {
  return {
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
}

describe('Expressions shared function tests', () => {
  beforeAll(() => {
    jest.spyOn(window, 'logError').mockImplementation(() => {});
  });
  afterAll(() => {
    jest.restoreAllMocks();
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
        instance: _instance,
        process: _process,
        permissions,
        frontendSettings,
        textResources,
        profileSettings,
      } = test;

      if (disabledFrontend) {
        // Skipped tests usually means that the frontend does not support the feature yet
        return;
      }

      const hasInstance = Boolean(_instance || instanceDataElements || _process || permissions);

      const instance =
        _instance && instanceDataElements
          ? { ..._instance, data: [..._instance.data, ...instanceDataElements] }
          : !_instance && instanceDataElements
            ? getInstanceDataMock((i) => {
                i.data = [...i.data, ...instanceDataElements];
              })
            : hasInstance
              ? getInstanceDataMock()
              : undefined;

      const process = _process
        ? _process
        : permissions
          ? getProcessDataMock((p) => {
              for (const key of Object.keys(permissions)) {
                p.currentTask![key] = permissions[key];
              }
            })
          : hasInstance
            ? getProcessDataMock()
            : undefined;

      const profile = getProfileMock();
      if (profileSettings?.language) {
        profile.profileSettingPreference.language = profileSettings.language;
      }

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
          fetchLayouts: async () => layouts ?? getDefaultLayouts(),
          fetchFormData: async () => dataModel ?? {},
          ...(instance ? { fetchInstanceData: async () => instance } : {}),
          ...(process ? { fetchProcessState: async () => process } : {}),
          ...(frontendSettings ? { fetchApplicationSettings: async () => frontendSettings } : {}),
          fetchUserProfile: async () => profile,
          fetchTextResources: async () => ({
            language: 'nb',
            resources: textResources || [],
          }),
        },
      });

      const errorMock = window.logError as jest.Mock;

      if (expectsFailure) {
        expect(errorMock).toHaveBeenCalledWith(expect.stringContaining(expectsFailure));
      } else {
        ExprValidation.throwIfInvalidNorScalar(expression);
        const result = JSON.parse((await screen.findByTestId('expr-result')).textContent!);
        expect(result).toEqual(expects);
        expect(errorMock).not.toHaveBeenCalled();
      }

      errorMock.mockClear();
    });
  });
});
