import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { act, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { applicationMetadataMock } from 'src/__mocks__/applicationMetadataMock';
import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { ConfirmPage, type IConfirmPageProps } from 'src/features/confirm/containers/ConfirmPage';
import { renderWithProviders } from 'src/test/renderWithProviders';

describe('ConfirmPage', () => {
  const props: IConfirmPageProps = {
    appName: 'Irrelevant',
    instance: getInstanceDataMock(),
    parties: [],
    applicationMetadata: applicationMetadataMock,
  };
  it('should present confirm information when necessary data is present', () => {
    renderWithProviders(
      <MemoryRouter>
        <ConfirmPage {...props} />
      </MemoryRouter>,
      { preloadedState: getInitialStateMock() },
    );
    const title = screen.getByText('Se over svarene dine før du sender inn');
    expect(title).toBeInTheDocument();

    const contentLoader = screen.queryByText('Loading...');
    expect(contentLoader).not.toBeInTheDocument();
  });

  it('should present pdf as part of previously submitted data', () => {
    renderWithProviders(
      <MemoryRouter>
        <ConfirmPage {...props} />
      </MemoryRouter>,
      { preloadedState: getInitialStateMock() },
    );
    const pdf = screen.getByText('mockApp.pdf');
    expect(pdf).toBeInTheDocument();

    const contentLoader = screen.queryByText('Loading...');
    expect(contentLoader).not.toBeInTheDocument();
  });

  it('should show loading when clicking submit', async () => {
    const user = userEvent.setup();
    window.instanceId = getInstanceDataMock()?.id;
    const { store } = renderWithProviders(
      <MemoryRouter>
        <ConfirmPage {...props} />
      </MemoryRouter>,
      { preloadedState: getInitialStateMock() },
    );
    const dispatch = jest.spyOn(store, 'dispatch');

    const submitBtnText = /send inn/i;
    const loadingText = /laster innhold/i;

    const submitBtn = screen.getByText(submitBtnText);

    expect(dispatch).toHaveBeenCalledTimes(0);
    expect(screen.queryByText(loadingText)).not.toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();
    await act(() => user.click(submitBtn));

    expect(screen.getByText(submitBtnText)).toBeInTheDocument();
    expect(screen.getByText(loadingText)).toBeInTheDocument();
    expect(dispatch).toHaveBeenCalledTimes(0);
  });
});
