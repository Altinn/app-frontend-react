import React from 'react';

import { screen } from '@testing-library/react';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { ErrorReport } from 'src/components/message/ErrorReport';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';

describe('ErrorReport', () => {
  const render = async (_validations) => {
    const reduxState = getInitialStateMock({
      // formValidations: mockValidationState,
    });

    return await renderWithInstanceAndLayout({
      renderer: () => <ErrorReport nodes={[]} />,
      reduxState,
    });
  };

  it('should not render when there are no errors', async () => {
    await render({});
    expect(screen.queryByTestId('ErrorReport')).not.toBeInTheDocument();
  });

  it.skip('should list unmapped errors as unclickable', async () => {
    const validations = {
      unmapped: {
        // unmapped layout
        unmapped: {
          // unmapped component
          unmapped: {
            // unmapped data binding
            errors: ['some unmapped error'],
          },
        },
      },
    };

    await render(validations);
    expect(screen.getByTestId('ErrorReport')).toBeInTheDocument();

    // Unmapped errors should not be clickable
    const errorNode = screen.getByText('some unmapped error');
    expect(errorNode).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(errorNode.parentElement?.tagName).toEqual('LI');
  });

  it.skip('should list mapped error as clickable', async () => {
    const validations = {
      page1: {
        someComponent: {
          simpleBinding: {
            errors: ['some mapped error'],
          },
        },
      },
    };

    await render(validations);
    expect(screen.getByTestId('ErrorReport')).toBeInTheDocument();

    const errorNode = screen.getByText('some mapped error');
    expect(errorNode).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(errorNode.parentElement?.parentElement?.tagName).toEqual('LI');
    // eslint-disable-next-line testing-library/no-node-access
    expect(errorNode.parentElement?.tagName).toEqual('BUTTON');
  });
});
