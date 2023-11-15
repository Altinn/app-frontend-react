import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { getApplicationMetadataMock } from 'src/__mocks__/applicationMetadataMock';
import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { ConfirmPage, type IConfirmPageProps } from 'src/features/confirm/containers/ConfirmPage';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';

describe('ConfirmPage', () => {
  const props: IConfirmPageProps = {
    appName: 'Irrelevant',
    instance: getInstanceDataMock(),
    parties: [],
    applicationMetadata: getApplicationMetadataMock(),
  };
  it('should present confirm information when necessary data is present', async () => {
    await renderWithInstanceAndLayout({
      renderer: () => <ConfirmPage {...props} />,
    });
    const title = screen.getByText('Se over svarene dine før du sender inn');
    expect(title).toBeInTheDocument();

    const contentLoader = screen.queryByText('Loading...');
    expect(contentLoader).not.toBeInTheDocument();
  });

  it('should present pdf as part of previously submitted data', async () => {
    await renderWithInstanceAndLayout({
      renderer: () => <ConfirmPage {...props} />,
    });
    const pdf = screen.getByText('mockApp.pdf');
    expect(pdf).toBeInTheDocument();

    const contentLoader = screen.queryByText('Loading...');
    expect(contentLoader).not.toBeInTheDocument();
  });

  it('should show loading when clicking submit', async () => {
    window.instanceId = getInstanceDataMock()?.id;
    const { mutations } = await renderWithInstanceAndLayout({
      renderer: () => <ConfirmPage {...props} />,
      reduxState: getInitialStateMock((state) => {
        state.deprecated.lastKnownProcess!.currentTask!.actions = {
          confirm: true,
        };
      }),
      reduxGateKeeper: (action) =>
        !!('type' in action && (action.type.startsWith('deprecated/') || action.type === 'formData/submitReady')),
    });

    const submitBtnText = /send inn/i;
    const loadingText = /laster innhold/i;

    const submitBtn = screen.getByRole('button', { name: submitBtnText });

    expect(mutations.doProcessNext.mock).toHaveBeenCalledTimes(0);
    expect(screen.queryByText(loadingText)).not.toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();
    await userEvent.click(submitBtn);

    expect(mutations.doProcessNext.mock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: submitBtnText })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(loadingText)).toBeInTheDocument();
    });
  });
});
