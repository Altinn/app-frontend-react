import React, { createContext } from 'react';
import type { PropsWithChildren } from 'react';

import { useQuery } from '@tanstack/react-query';

import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { appDataQueries } from 'src/features/appData/AppDataService';
import { VersionErrorOrChildren } from 'src/features/applicationMetadata/VersionErrorOrChildren';
import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';
import { useNavigationParam } from 'src/hooks/navigation';
import { ILayoutSets } from 'src/layout/common.generated';

type AppData = {
  appMetadata: ApplicationMetadata;
  layoutSets: ILayoutSets;
};

export const AppDataContext = createContext<AppData | null>(null);
export function AppDataContextProvider({ children }: PropsWithChildren) {
  const instanceGuid = useNavigationParam('instanceGuid');
  const appMetadataQuery = useQuery(appDataQueries.applicationMetadata(instanceGuid));
  const layoutSetsQuery = useQuery(appDataQueries.layoutSets());

  if (appMetadataQuery.isPending) {
    return <Loader reason='fetching-applicationMetadata' />;
  }
  if (appMetadataQuery.isError) {
    return <DisplayError error={appMetadataQuery.error} />;
  }
  if (layoutSetsQuery.isPending) {
    return <Loader reason='fetching-layoutSets' />;
  }

  if (layoutSetsQuery.error) {
    return <DisplayError error={layoutSetsQuery.error} />;
  }

  return (
    <AppDataContext.Provider value={{ appMetadata: appMetadataQuery.data, layoutSets: layoutSetsQuery.data }}>
      <VersionErrorOrChildren>{children}</VersionErrorOrChildren>
    </AppDataContext.Provider>
  );
}
