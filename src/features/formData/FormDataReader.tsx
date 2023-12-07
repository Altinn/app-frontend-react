import React from 'react';
import type { PropsWithChildren } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios/index';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { getDataTypeByLayoutSetId, isStatelessApp } from 'src/features/applicationMetadata/appMetadataUtils';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { FormDataWriteProvider } from 'src/features/formData/FormDataWriter';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { MissingRolesError } from 'src/features/instantiate/containers/MissingRolesError';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useAllowAnonymous } from 'src/features/stateless/getAllowAnonymous';
import { isAxiosError } from 'src/utils/isAxiosError';
import { maybeAuthenticationRedirect } from 'src/utils/maybeAuthenticationRedirect';
import { HttpStatusCodes } from 'src/utils/network/networking';
import { getFetchFormDataUrl, getStatelessFormDataUrl } from 'src/utils/urls/appUrlHelper';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

function useFormDataQuery() {
  const appMetaData = useApplicationMetadata();
  const currentPartyId = useCurrentParty()?.partyId;
  const allowAnonymous = useAllowAnonymous();
  const isStateless = isStatelessApp(appMetaData);

  // We also add the current task id to the query key, so that the query is refetched when the task changes. This
  // is needed because we have logic waiting for the form data to be fetched before we can continue (even if the
  // data element used is the same one between two different tasks - in which case it could also have been changed
  // on the server).
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const dataElementUuid = useCurrentDataModelGuid();

  const instance = useLaxInstanceData();
  const layoutSets = useLayoutSets();
  const statelessDataType = isStateless
    ? getDataTypeByLayoutSetId({
        layoutSetId: appMetaData?.onEntry?.show,
        layoutSets,
        appMetaData,
      })
    : undefined;

  const url =
    isStateless && statelessDataType
      ? getStatelessFormDataUrl(statelessDataType, allowAnonymous)
      : instance && dataElementUuid
        ? getFetchFormDataUrl(instance.id, dataElementUuid)
        : undefined;

  const options: AxiosRequestConfig = {};
  if (isStateless && currentPartyId !== undefined) {
    options.headers = {
      party: `partyid:${currentPartyId}`,
    };
  }

  const enabled = url !== undefined;
  const { fetchFormData } = useAppQueries();
  const utils = useQuery({
    queryKey: ['fetchFormData', url, currentTaskId],
    queryFn: async () => await fetchFormData(url!, options),
    enabled,
    onError: async (error: HttpClientError) => {
      if (error.message?.includes('403')) {
        // This renders the <MissingRolesError /> component in the provider
        window.logInfo('Current party is missing roles');
      } else {
        window.logError('Fetching form data failed:\n', error);
      }

      const wasRedirected = await maybeAuthenticationRedirect(error);
      if (!wasRedirected) {
        throw error;
      }
    },
  });

  return {
    ...utils,
    enabled,
    url,
    dataElementUuid,
  };
}

/**
 * This provider loads the initial form data for a data task, and then provides a FormDataWriteProvider with that
 * initial data. When this is provided, you'll have the tools needed to read/write form data.
 *
 * @see FormDataProvider
 */
export function FormDataReadWriteProvider({ children }: PropsWithChildren) {
  const { error, isLoading, data, enabled, dataElementUuid } = useFormDataQuery();

  if (!enabled || !dataElementUuid) {
    return <>{children}</>;
  }

  if (error) {
    // Error trying to fetch data, if missing rights we display relevant page
    if (isAxiosError(error) && error.response?.status === HttpStatusCodes.Forbidden) {
      return <MissingRolesError />;
    }

    return <DisplayError error={error} />;
  }

  if (isLoading || !data) {
    return <Loader reason='formdata' />;
  }

  return (
    <FormDataWriteProvider
      uuid={dataElementUuid}
      initialData={data}
    >
      {children}
    </FormDataWriteProvider>
  );
}
