import React from 'react';

import { screen } from '@testing-library/react';

import { ErrorReport } from 'src/components/message/ErrorReport';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';

describe('ErrorReport', () => {
  const render = async () =>
    await renderWithInstanceAndLayout({
      renderer: () => <ErrorReport nodes={[]} />,
    });

  it('should not render when there are no errors', async () => {
    await render();
    expect(screen.queryByTestId('ErrorReport')).not.toBeInTheDocument();
  });

  it('should list unmapped errors as unclickable', async () => {
    const _validations = {
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

    await render();
    expect(screen.getByTestId('ErrorReport')).toBeInTheDocument();

    // Unmapped errors should not be clickable
    const errorNode = screen.getByText('some unmapped error');
    expect(errorNode).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(errorNode.parentElement?.tagName).toEqual('LI');
  });

  it('should list mapped error as clickable', async () => {
    const _validations = {
      page1: {
        someComponent: {
          simpleBinding: {
            errors: ['some mapped error'],
          },
        },
      },
    };

    await render();
    expect(screen.getByTestId('ErrorReport')).toBeInTheDocument();

    const errorNode = screen.getByText('some mapped error');
    expect(errorNode).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(errorNode.parentElement?.parentElement?.tagName).toEqual('LI');
    // eslint-disable-next-line testing-library/no-node-access
    expect(errorNode.parentElement?.tagName).toEqual('BUTTON');
  });
});
