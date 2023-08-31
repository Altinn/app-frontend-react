import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { convertModelToDataBinding } from 'src/utils/databindings';
import { getRepeatingGroups } from 'src/utils/formLayout';
import type { ILayouts } from 'src/layout/layout';
import type { IRepeatingGroups } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

enum ServerStateCacheKey {
  RepeatingGroups = 'repeatingGroups',
}
export const useRepeatingGroupsQuery = (
  instanceId: string,
  currentTaskDataId: string,
  layouts: ILayouts,
  enabled?: boolean,
): UseQueryResult<IRepeatingGroups> => {
  const { fetchFormData } = useAppQueriesContext();

  return useQuery(
    [ServerStateCacheKey.RepeatingGroups, instanceId, currentTaskDataId],
    () => fetchFormData(instanceId, currentTaskDataId).then((formData) => mapResponse(formData, layouts)),
    {
      enabled,
      onSuccess: (repeatingGroups) => {},
      onError: (error: HttpClientError) => {
        window.logError('Fetching FormData failed:\n', error);
      },
    },
  );
};

const mapResponse = (formData, layouts) => {
  const convertedFormData = convertModelToDataBinding(formData);
  let newGroups: IRepeatingGroups = {};
  Object.keys(layouts).forEach((layoutKey: string) => {
    newGroups = {
      ...newGroups,
      ...getRepeatingGroups(layouts[layoutKey], convertedFormData),
    };
  });
  return newGroups;
};
