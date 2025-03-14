import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AxiosError } from 'axios';

import { defaultMockDataElementId } from 'src/__mocks__/getInstanceDataMock';
import { defaultDataTypeMock } from 'src/__mocks__/getLayoutSetsMock';
import { Form } from 'src/components/form/Form';
import { type BackendValidationIssue, BackendValidationSeverity } from 'src/features/validation';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';

describe('ErrorReport', () => {
  const render = async (validationIssues: BackendValidationIssue[] = []) =>
    await renderWithInstanceAndLayout({
      initialPage: 'submit',
      renderer: () => <Form />,
      queries: {
        fetchBackendValidations: async () => validationIssues,
        fetchLayoutSettings: async () => ({
          pages: {
            order: ['form', 'submit'],
          },
        }),
        fetchLayouts: async () => ({
          form: {
            data: {
              layout: [
                {
                  id: 'input',
                  type: 'Input',
                  dataModelBindings: {
                    simpleBinding: { dataType: defaultDataTypeMock, field: 'boundField' },
                  },
                },
              ],
            },
          },
          submit: {
            data: {
              layout: [
                {
                  id: 'submit',
                  type: 'Button',
                  textResourceBindings: {
                    title: 'Submit',
                  },
                },
              ],
            },
          },
        }),
        fetchTextResources: async () => ({
          language: 'nb',
          resources: [
            {
              id: 'submit',
              value: 'This is a page title',
            },
          ],
        }),
      },
    });

  it('should not render when there are no errors', async () => {
    await render();
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.queryByTestId('ErrorReport')).not.toBeInTheDocument();
  });

  it('should list task errors as unclickable', async () => {
    const { mutations } = await render();

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    mutations.doProcessNext.reject({
      name: 'AxiosError',
      message: 'Request failed with status code 409',
      response: {
        status: 409,
        data: {
          validationIssues: [
            {
              customTextKey: 'some unmapped error',
              source: 'taskValidator',
              severity: BackendValidationSeverity.Error,
            } as BackendValidationIssue,
          ],
        },
      },
    } as AxiosError);

    await screen.findByTestId('ErrorReport');

    // Unmapped errors should not be clickable
    const errorNode = await screen.findByText('some unmapped error');

    expect(errorNode.parentElement?.tagName).toEqual('LI');
  });

  it('should list unbound mapped error as unclickable', async () => {
    const { mutations } = await render();

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    mutations.doProcessNext.reject({
      name: 'AxiosError',
      message: 'Request failed with status code 409',
      response: {
        status: 409,
        data: {
          validationIssues: [
            {
              customTextKey: 'some unbound mapped error',
              field: 'unboundField',
              dataElementId: defaultMockDataElementId,
              severity: BackendValidationSeverity.Error,
              source: 'custom',
            } as BackendValidationIssue,
          ],
        },
      },
    } as AxiosError);

    await screen.findByTestId('ErrorReport');

    // mapped errors not bound to any component should not be clickable
    const errorNode = await screen.findByText('some unbound mapped error');

    expect(errorNode.parentElement?.tagName).toEqual('LI');
  });

  it('should list mapped error as clickable', async () => {
    await render([
      {
        customTextKey: 'some mapped error',
        field: 'boundField',
        dataElementId: defaultMockDataElementId,
        severity: BackendValidationSeverity.Error,
        source: 'custom',
      } as BackendValidationIssue,
    ]);

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await screen.findByTestId('ErrorReport');
    const errorNode = await screen.findByText('some mapped error');

    expect(errorNode.parentElement?.tagName).toEqual('BUTTON');

    expect(errorNode.parentElement?.parentElement?.tagName).toEqual('LI');
  });
});
