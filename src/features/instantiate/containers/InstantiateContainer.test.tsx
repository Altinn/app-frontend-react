import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { screen, waitFor, within } from '@testing-library/react';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { renderWithProviders } from 'src/test/renderWithProviders';
import { HttpStatusCodes } from 'src/utils/network/networking';
import type { AppQueriesContext } from 'src/contexts/appQueriesContext';
import type { IRuntimeState } from 'src/types';

interface RenderProps {
  queries?: Partial<AppQueriesContext>;
  initialState?: Partial<IRuntimeState>;
}

describe('InstantiateContainer', () => {
  function DefinedRoutes({ children }: React.PropsWithChildren) {
    return (
      <Routes>
        <Route
          path={'/ttd/test'}
          element={children}
        >
          <Route
            path='instance/:partyId/:instanceGuid/*'
            element={<div>Instance page</div>}
          />
        </Route>
      </Routes>
    );
  }

  const render = ({ initialState, queries }: RenderProps) => {
    const stateMock = getInitialStateMock(initialState);
    return renderWithProviders({
      Router: DefinedRoutes,
      component: <InstantiateContainer />,
      preloadedState: stateMock,
      mockedQueries: queries,
    });
  };

  it('should show content loader on initial render and start instantiation if valid party', async () => {
    const mockInstantiate = jest.fn().mockImplementation(() => Promise.resolve(getInstanceDataMock()));
    await render({
      queries: {
        doInstantiate: mockInstantiate,
      },
    });

    const contentLoader = await screen.findByText('Loading...');
    expect(contentLoader).toBeInTheDocument();

    const instantiationText = within(await screen.findByTestId('presentation-heading')).getByText(
      'Vent litt, vi henter det du trenger',
    );

    expect(instantiationText).toBeInTheDocument();
    expect(screen.queryByText('Instance page')).not.toBeInTheDocument();
    expect(mockInstantiate).toHaveBeenCalledTimes(1);
  });

  it('should not call InstantiationActions.instantiate when no selected party', async () => {
    const mockInstantiate = jest.fn();
    await render({
      initialState: {
        party: {
          parties: [],
          error: null,
          selectedParty: null,
        },
      },
      queries: {
        doInstantiate: mockInstantiate,
      },
    });

    await waitFor(() => {
      expect(mockInstantiate).toHaveBeenCalledTimes(0);
    });

    const contentLoader = await screen.findByText('Loading...');
    expect(contentLoader).toBeInTheDocument();
  });

  it('should redirect when instanceId is set', async () => {
    const mockInstantiate = jest.fn();
    const mockFetchInstanceData = jest.fn().mockImplementation(() => Promise.resolve(getInstanceDataMock()));
    await render({
      queries: {
        doInstantiate: mockInstantiate,
        fetchInstanceData: mockFetchInstanceData,
      },
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Instance page')).toBeInTheDocument();
    expect(mockInstantiate).toHaveBeenCalledTimes(0);
    expect(mockFetchInstanceData).toHaveBeenCalledTimes(1);
  });

  it('should show unknown error for generic errors', async () => {
    const error = {
      message: 'instantiation error',
      name: 'AxiosError',
      config: {},
      isAxiosError: true,
      response: {
        data: {},
      },
    };

    const mockInstantiate = jest.fn().mockImplementation(() => Promise.reject(error));
    await render({
      queries: {
        doInstantiate: mockInstantiate,
      },
    });

    expect(screen.getAllByText('Ukjent feil')[0]).toBeInTheDocument();
  });

  it('should show missing access when http status is forbidden', async () => {
    const error = {
      message: 'instantiation error',
      name: 'AxiosError',
      config: {},
      isAxiosError: true,
      response: {
        status: HttpStatusCodes.Forbidden,
      },
    };

    const mockInstantiate = jest.fn().mockImplementation(() => Promise.reject(error));
    await render({
      queries: {
        doInstantiate: mockInstantiate,
      },
    });

    expect(screen.getByText('Feil 403')).toBeInTheDocument();
    expect(screen.getByText('Du mangler rettigheter for å se denne tjenesten.')).toBeInTheDocument();
  });

  it('should show instantiation error page when axios error contains a message', async () => {
    const error = {
      message: 'instantiation error',
      name: 'AxiosError',
      config: {},
      isAxiosError: true,
      response: {
        status: HttpStatusCodes.Forbidden,
        data: {
          message: 'axios error',
        },
      },
    };

    const mockInstantiate = jest.fn().mockImplementation(() => Promise.reject(error));
    await render({
      queries: {
        doInstantiate: mockInstantiate,
      },
    });

    expect(screen.getByText('Feil 403')).toBeInTheDocument();
    expect(screen.getByText('axios error')).toBeInTheDocument();
  });
});
