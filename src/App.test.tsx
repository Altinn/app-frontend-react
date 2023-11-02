import React from 'react';

import { screen } from '@testing-library/react';

import { App } from 'src/App';
import { renderWithProviders } from 'src/test/renderWithProviders';

describe('App', () => {
  test('should render unknown error when hasApplicationSettingsError', async () => {
    await renderWithProviders({
      component: <App />,
      mockedQueries: {
        fetchApplicationSettings: () => Promise.reject(new Error('400 Bad Request')),
      },
    });
    await screen.findByRole('heading', { level: 1, name: 'Ukjent feil' });
  });

  test('should render unknown error when hasApplicationMetadataError', async () => {
    await renderWithProviders({
      component: <App />,
      mockedQueries: {
        fetchApplicationMetadata: () => Promise.reject(new Error('400 Bad Request')),
      },
    });
    await screen.findByRole('heading', { level: 1, name: 'Ukjent feil' });
  });

  test('should render unknown error when hasLayoutSetError', async () => {
    await renderWithProviders({
      component: <App />,
      mockedQueries: {
        fetchLayoutSets: () => Promise.reject(new Error('400 Bad Request')),
      },
    });
    await screen.findByRole('heading', { level: 1, name: 'Ukjent feil' });
  });

  test('should render unknown error when hasOrgsError', async () => {
    await renderWithProviders({
      component: <App />,
      mockedQueries: {
        fetchOrgs: () => Promise.reject(new Error('400 Bad Request')),
      },
    });
    await screen.findByRole('heading', { level: 1, name: 'Ukjent feil' });
  });
});
