import React from 'react';

import { jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { getPartyMock } from 'src/__mocks__/getPartyMock';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import { AltinnPalette } from 'src/theme/altinnAppTheme';
import { ProcessTaskType } from 'src/types';
import { returnUrlToMessagebox } from 'src/utils/urls/urlHelper';
import type { IPresentationProvidedProps } from 'src/components/presentation/Presentation';
import type { AppQueries } from 'src/queries/types';

jest.mock('axios');
const assignMock = jest.fn();

describe('Presentation', () => {
  const user = userEvent.setup();
  let realLocation: Location = window.location;

  beforeEach(() => {
    realLocation = window.location;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change window.location.href to query parameter returnUrl if valid URL', async () => {
    const returnUrl = 'foo';

    const mockedLocation = { ...realLocation, search: `?returnUrl=${returnUrl}`, assign: assignMock };
    jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

    await render({ type: ProcessTaskType.Data }, { fetchReturnUrl: async () => returnUrl });

    expect(window.location.href).not.toEqual(returnUrl);

    const closeButton = screen.getByRole('button', {
      name: /tilbake/i,
    });
    screen.debug();
    await user.click(closeButton);

    expect(assignMock).toHaveBeenCalledWith(returnUrl);
  });

  it('should change window.location.href to default messagebox url if query parameter returnUrl is not valid', async () => {
    const host = 'ttd.apps.tt02.altinn.no';
    const returnUrl = 'https://altinn.cloud.no';
    const mockedLocation = { ...realLocation, search: `?returnUrl=${returnUrl}`, assign: assignMock, host };
    jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);
    const messageBoxUrl = returnUrlToMessagebox(host, getPartyMock().partyId);

    // TODO: Replicate stateWithErrorsAndWarnings?
    await render({ type: ProcessTaskType.Data });

    expect(window.location.href).not.toEqual(messageBoxUrl);

    const closeButton = screen.getByRole('button', {
      name: /tilbake til innboks/i,
    });

    await user.click(closeButton);

    expect(assignMock).toHaveBeenCalledWith(messageBoxUrl);
  });

  it('should change window.location.href to default messagebox url if query parameter returnUrl is not found', async () => {
    const host = 'ttd.apps.tt02.altinn.no';
    const partyId = getPartyMock().partyId;
    const messageBoxUrl = returnUrlToMessagebox(host, partyId);
    const mockedLocation = { ...realLocation, assign: assignMock, host, search: '' };

    jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

    // TODO: Replicate stateWithErrorsAndWarnings?
    await render({ type: ProcessTaskType.Data });

    expect(window.location.href).not.toEqual(messageBoxUrl);

    const closeButton = screen.getByRole('button', {
      name: /tilbake til innboks/i,
    });
    await user.click(closeButton);

    expect(assignMock).toHaveBeenCalledWith(messageBoxUrl);
  });

  it('should render children', async () => {
    await render({
      type: ProcessTaskType.Data,
      children: <div data-testid='child-component' />,
    });

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  it('the background color should be greyLight if type is "ProcessTaskType.Data"', async () => {
    await render({ type: ProcessTaskType.Data });

    const appHeader = screen.getByTestId('AltinnAppHeader');

    expect(appHeader).toHaveStyle(`background-color: ${AltinnPalette.greyLight}`);
  });

  it('the background color should be lightGreen if type is "ProcessTaskType.Archived"', async () => {
    await render({ type: ProcessTaskType.Archived });

    const appHeader = screen.getByTestId('AltinnAppHeader');

    expect(appHeader).toHaveStyle(`background-color: ${AltinnPalette.greenLight}`);
  });
});

const render = async (props: Partial<IPresentationProvidedProps> = {}, queries: Partial<AppQueries> = {}) => {
  const allProps = {
    header: 'Header text',
    type: ProcessTaskType.Unknown,
    ...props,
  };

  await renderWithInstanceAndLayout({
    renderer: () => <PresentationComponent {...allProps} />,
    taskId: 'Task_1',
    queries: {
      ...queries,
    },
  });
};
