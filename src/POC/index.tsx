import React from 'react';
import { Outlet } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ErrorBoundary } from 'src/components/ErrorBoundary';
import { ThemeWrapper } from 'src/components/ThemeWrapper';
import { UiConfigProvider } from 'src/features/form/layout/UiConfigContext';

export function POC() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeWrapper>
          <UiConfigProvider>
            <Outlet />
          </UiConfigProvider>
        </ThemeWrapper>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
