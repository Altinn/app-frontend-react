import { queryOptions } from '@tanstack/react-query';

import { onEntryValuesThatHaveState } from 'src/features/applicationMetadata/appMetadataUtils';
import { MINIMUM_APPLICATION_VERSION } from 'src/features/applicationMetadata/minVersion';
import { fetchApplicationMetadata } from 'src/queries/queries';
import { isAtLeastVersion } from 'src/utils/versionCompare';
import type { ApplicationMetadata, IncomingApplicationMetadata } from 'src/features/applicationMetadata/types';

function isStatelessApp(hasInstanceGuid: boolean, show: ApplicationMetadata['onEntry']['show']) {
  // App can be setup as stateless but then go over to a stateful process task
  return hasInstanceGuid ? false : !!show && !onEntryValuesThatHaveState.includes(show);
}

export const appDataQueries = {
  all: () => ['appData'],
  applicationMetadata: (instanceGuid?: string) =>
    queryOptions<IncomingApplicationMetadata, Error, ApplicationMetadata>({
      queryKey: [appDataQueries.all(), 'applicationMetadata', instanceGuid],
      queryFn: fetchApplicationMetadata,
      select: (data) => {
        const onEntry = data.onEntry ?? { show: 'new-instance' };

        return {
          ...data,
          isValidVersion:
            !!data.altinnNugetVersion &&
            isAtLeastVersion({
              actualVersion: data.altinnNugetVersion,
              minimumVersion: MINIMUM_APPLICATION_VERSION.build,
            }),
          onEntry,
          isStatelessApp: isStatelessApp(!!instanceGuid, onEntry.show),
          logoOptions: data.logo,
        };
      },
    }),
  orgs: () => [...appDataQueries.all(), 'orgs'],
  layoutSets: () => [...appDataQueries.all(), 'layoutSets'],
} as const;
