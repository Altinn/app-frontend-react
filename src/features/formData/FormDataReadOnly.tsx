import React from 'react';
import type { PropsWithChildren } from 'react';

import { useQuery } from '@tanstack/react-query';

import { createContext } from 'src/core/contexts/context';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useTextResources } from 'src/features/language/textResources/TextResourcesProvider';
import { getDataElementUrl } from 'src/utils/urls/appUrlHelper';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

/**
 * This query fetches all form data referenced in text resources, and merges them into a single object.
 * This is used to support 'info tasks' that may fetch and show data in text resources from previous tasks/form data.
 *
 * @deprecated This is a temporary solution until we have a better way of handling this. Ideally useLanguage() should
 *            be able to fetch data from previous tasks on-demand once the text resource reference is used.
 */
function useMergedFormDataQuery(taskId: string | undefined) {
  const appMetadata = useApplicationMetadata();
  const textResources = useTextResources();
  const instance = useLaxInstanceData();

  const urlsToFetch: string[] = [];
  for (const resource of Object.values(textResources)) {
    for (const variable of resource?.variables || []) {
      const modelName = variable.dataSource.replace('dataModel.', '');
      const dataType = appMetadata?.dataTypes.find((d) => d.id === modelName);
      if (!dataType) {
        continue;
      }

      const dataElement = instance?.data.find((e) => e.dataType === dataType.id);
      if (!dataElement || !instance?.id) {
        continue;
      }
      urlsToFetch.push(getDataElementUrl(instance.id, dataElement.id));
    }
  }

  return useQuery<any, HttpClientError>({
    queryKey: ['fetchFormData', urlsToFetch, taskId],
    queryFn: async () => {
      const out: any = {};
      return out;
    },
  });
}

const { Provider, useCtx } = createContext<any>({
  name: 'FormDataReadOnly',
  required: false,
  default: {},
});

export const FormDataReadOnlyProvider = Provider;
export const useFormDataReadOnly = () => useCtx();

/**
 * This provider will fetch all form data referenced in text resources, and merge them into a single object, for use
 * in an info-task.
 *
 * @deprecated See useMergedFormDataQuery() for more information.
 * @see FormDataReadWriteProvider
 */
export function FormDataForInfoTaskProvider({ children, taskId }: PropsWithChildren<{ taskId: string | undefined }>) {
  const { data, isLoading, error } = useMergedFormDataQuery(taskId);

  if (error) {
    return <DisplayError error={error} />;
  }

  if (isLoading) {
    return <Loader reason='query-FormDataReadOnly' />;
  }

  return <FormDataReadOnlyProvider value={data}>{children}</FormDataReadOnlyProvider>;
}
