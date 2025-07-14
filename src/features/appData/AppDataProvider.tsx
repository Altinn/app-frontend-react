import React, { createContext } from 'react';
import type { PropsWithChildren } from 'react';

import { useQuery } from '@tanstack/react-query';

import { ErrorPaper } from 'src/components/message/ErrorPaper';
import { loadingClassName } from 'src/components/ReadyForPrint';
import { appDataQueries } from 'src/features/appData/AppDataService';
import { VersionErrorOrChildren } from 'src/features/applicationMetadata/VersionErrorOrChildren';
import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';
import { useNavigationParam } from 'src/hooks/navigation';

type AppData = {
  appMetadata: ApplicationMetadata;
};

export const AppDataContext = createContext<AppData | null>(null);
export function AppDataContextProvider({ children }: PropsWithChildren) {
  const instanceGuid = useNavigationParam('instanceGuid');
  const applicationMetadata = useQuery(appDataQueries.applicationMetadata(instanceGuid));

  if (applicationMetadata.isPending) {
    return <Loader />;
  }
  if (applicationMetadata.isError) {
    return <ErrorPaper message={applicationMetadata.error.message} />;
  }

  return (
    <AppDataContext.Provider value={{ appMetadata: applicationMetadata.data }}>
      <VersionErrorOrChildren>{children}</VersionErrorOrChildren>
    </AppDataContext.Provider>
  );
}

function Loader() {
  return <div className={loadingClassName}>Loading...</div>;
}
