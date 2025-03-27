import React from 'react';

import { useStore } from 'zustand';

import { InnerHeader } from 'src/components/presentation/Header';
import { initialStateStore } from 'src/next/stores/settingsStore';

interface HeaderType {
  dings?: string;
}

export const Header: React.FunctionComponent<HeaderType> = ({ dings }) => {
  const applicationMetadata = useStore(initialStateStore, (state) => state.applicationMetadata);

  const appName = applicationMetadata.title['nb'];

  return <InnerHeader header={appName} />;
};
