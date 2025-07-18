import { useContext } from 'react';

import { AppDataContext } from 'src/features/appData/AppDataProvider';
import type { GlobalPageSettings } from 'src/layout/common.generated';

function useAppDataContext() {
  const appDataContext = useContext(AppDataContext);
  if (!appDataContext) {
    throw new Error('No app data context');
  }

  return appDataContext;
}

export function useApplicationMetadata() {
  return useAppDataContext().appMetadata;
}

export function useLayoutSets() {
  return useAppDataContext().layoutSets.sets;
}

export function useGlobalUISettings(): GlobalPageSettings | undefined {
  return useAppDataContext().layoutSets.uiSettings;
}
