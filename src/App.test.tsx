import React from 'react';

import { screen } from '@testing-library/react';

import { App } from 'src/App';
import { renderWithProviders } from 'src/testUtils';

describe('App', () => {
  test('should render unknown error when hasApplicationSettingsError', async () => {
    renderWithProviders(<App />, {
      queries: {
        fetchApplicationSettings: () => Promise.reject(new Error('400 Bad Request')),
      },
    });
    await screen.findByRole('heading', { level: 1, name: 'Ukjent feil' });
  });

  test('should render unknown error when hasApplicationMetadataError', async () => {
    renderWithProviders(<App />, {
      queries: {
        fetchApplicationMetadata: () => Promise.reject(new Error('400 Bad Request')),
      },
    });
    await screen.findByRole('heading', { level: 1, name: 'Ukjent feil' });
  });

  test('should render unknown error when hasLayoutSetError', async () => {
    renderWithProviders(<App />, {
      queries: {
        fetchLayoutSets: () => Promise.reject(new Error('400 Bad Request')),
      },
    });
    await screen.findByRole('heading', { level: 1, name: 'Ukjent feil' });
  });

  test('should render unknown error when hasOrgsError', async () => {
    renderWithProviders(<App />, {
      queries: {
        fetchOrgs: () => Promise.reject(new Error('400 Bad Request')),
      },
    });
    await screen.findByRole('heading', { level: 1, name: 'Ukjent feil' });
  });
});
