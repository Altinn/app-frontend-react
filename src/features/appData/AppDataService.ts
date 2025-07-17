import { queryOptions } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

import { MINIMUM_APPLICATION_VERSION } from 'src/features/applicationMetadata/minVersion';
import { fetchApplicationMetadata, fetchLayoutSets } from 'src/queries/queries';
import { isAtLeastVersion } from 'src/utils/versionCompare';
import type {
  ApplicationMetadata,
  IncomingApplicationMetadata,
  ShowTypes,
} from 'src/features/applicationMetadata/types';

/**
 * Application metadata onEntry.show values that have a state full application
 */
export const onEntryValuesThatHaveState: ShowTypes[] = ['new-instance', 'select-instance'];

function isStatelessApp(hasInstanceGuid: boolean, show: ApplicationMetadata['onEntry']['show']) {
  // App can be setup as stateless but then go over to a stateful process task
  return hasInstanceGuid ? false : show && !onEntryValuesThatHaveState.includes(show);
}

export const appDataQueries = {
  allKey: () => ['appData'],
  appMetadataKey: () => [...appDataQueries.allKey(), 'applicationMetadata'],
  applicationMetadata: (instanceGuid?: string) =>
    queryOptions<IncomingApplicationMetadata, Error, ApplicationMetadata>({
      queryKey: [appDataQueries.appMetadataKey(), instanceGuid],
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
  layoutSets: () =>
    queryOptions({
      queryKey: ['layoutSets'],
      queryFn: async () => {
        const layoutSets = await fetchLayoutSets();
        if (layoutSets?.uiSettings?.taskNavigation) {
          return {
            ...layoutSets,
            uiSettings: {
              ...layoutSets.uiSettings,
              taskNavigation: layoutSets.uiSettings.taskNavigation.map((g) => ({ ...g, id: uuidv4() })),
            },
          };
        }
        return layoutSets;
      },
    }),
} as const;
