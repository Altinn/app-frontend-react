import { useContext } from 'react';

import { AppDataContext } from 'src/features/appData/AppDataProvider';

function useAppDataContext() {
  const appDataContext = useContext(AppDataContext);

  if (!appDataContext) {
    throw new Error('No app data context');
  }

  return appDataContext;
}

export function useApplicationMetadata() {
  const appDataContext = useAppDataContext();

  return appDataContext.appMetadata;
}
