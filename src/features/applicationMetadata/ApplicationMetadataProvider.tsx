import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { MINIMUM_APPLICATION_VERSION } from 'src/features/applicationMetadata/minVersion';
import { OldVersionError } from 'src/features/applicationMetadata/OldVersionError';
import { isAtLeastVersion } from 'src/utils/versionCompare';

// Also used for prefetching @see appPrefetcher.ts
export function useApplicationMetadataQueryDef() {
  const { fetchApplicationMetadata } = useAppQueries();
  return {
    queryKey: ['fetchApplicationMetadata'],
    queryFn: fetchApplicationMetadata,
  };
}

const useApplicationMetadataQuery = () => {
  const utils = useQuery(useApplicationMetadataQueryDef());

  useEffect(() => {
    utils.error && window.logError('Fetching application metadata failed:\n', utils.error);
  }, [utils.error]);

  return utils;
};

const { Provider, useCtx, useLaxCtx, useHasProvider } = delayedContext(() =>
  createQueryContext({
    name: 'ApplicationMetadata',
    required: true,
    query: useApplicationMetadataQuery,
  }),
);

function VerifyMinimumVersion({ children }: PropsWithChildren) {
  const { altinnNugetVersion } = useApplicationMetadata();
  if (
    !altinnNugetVersion ||
    !isAtLeastVersion({
      actualVersion: altinnNugetVersion,
      minimumVersion: MINIMUM_APPLICATION_VERSION.build,
      allowZeroInLast: true,
    })
  ) {
    return <OldVersionError minVer={MINIMUM_APPLICATION_VERSION.name} />;
  }

  return children;
}

export function ApplicationMetadataProvider({ children }: PropsWithChildren) {
  return (
    <Provider>
      <VerifyMinimumVersion>{children}</VerifyMinimumVersion>
    </Provider>
  );
}
export const useApplicationMetadata = () => useCtx();
export const useLaxApplicationMetadata = () => useLaxCtx();
export const useHasApplicationMetadata = () => useHasProvider();
