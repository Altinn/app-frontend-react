import React from 'react';

import { useStore } from 'zustand';

import { InnerHeader } from 'src/components/presentation/Header';
import { initialStateStore } from 'src/next-prev/stores/settingsStore';

export const Header: React.FunctionComponent = () => {
  const applicationMetadata = useStore(initialStateStore, (state) => state.applicationMetadata);

  const appName = applicationMetadata.title['nb'];

  return (
    <InnerHeader
      header={appName}
      aboveHeader={applicationMetadata.org}
    />
  );
};
