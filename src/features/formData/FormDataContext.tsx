import React, { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios/index';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { FormDynamicsActions } from 'src/features/dynamics/formDynamicsSlice';
import { StatelessReadyState, useStatelessReadyState } from 'src/features/entrypoint/useStatelessReadyState';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { FormRulesActions } from 'src/features/formRules/rulesSlice';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useRealTaskType } from 'src/features/instance/useProcess';
import { Loader } from 'src/features/isLoading/Loader';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';
import { ProcessTaskType } from 'src/types';
import { getDataTypeByLayoutSetId, isStatelessApp } from 'src/utils/appMetadata';
import { createLaxContext } from 'src/utils/createContext';
import { convertModelToDataBinding } from 'src/utils/databindings';
import { maybeAuthenticationRedirect } from 'src/utils/maybeAuthenticationRedirect';
import { getFetchFormDataUrl, getStatelessFormDataUrl } from 'src/utils/urls/appUrlHelper';
import type { IFormData } from 'src/features/formData/index';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const { Provider } = createLaxContext<undefined>(undefined);

export const FormDataProvider = ({ children }) => {
  const { isLoading } = useFormDataQuery();

  if (isLoading) {
    return <Loader />;
  }

  return <Provider value={undefined}>{children}</Provider>;
};

function useFormDataQuery(): UseQueryResult<IFormData> {
  const dispatch = useAppDispatch();
  const reFetchActive = useAppSelector((state) => state.formData.reFetch);
  const appMetaData = useAppSelector((state) => state.applicationMetadata.applicationMetadata);
  const currentPartyId = useAppSelector((state) => state.party.selectedParty?.partyId);
  const taskType = useRealTaskType();
  const statelessReady = useStatelessReadyState();
  const allowAnonymousSelector = makeGetAllowAnonymousSelector();
  const allowAnonymous = useAppSelector(allowAnonymousSelector);
  const isStateless = isStatelessApp(appMetaData);

  let isEnabled = isStateless
    ? statelessReady === StatelessReadyState.Loading || statelessReady === StatelessReadyState.Ready
    : taskType === ProcessTaskType.Data;
  if (isStateless && !allowAnonymous && currentPartyId === undefined) {
    isEnabled = false;
  }

  const instance = useLaxInstanceData();
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);
  const statelessDataType = isStateless
    ? getDataTypeByLayoutSetId(appMetaData?.onEntry?.show, layoutSets, appMetaData)
    : undefined;
  const currentTaskDataId = useCurrentDataModelGuid();

  const url =
    isStateless && statelessDataType
      ? getStatelessFormDataUrl(statelessDataType, allowAnonymous)
      : instance && currentTaskDataId
      ? getFetchFormDataUrl(instance.id, currentTaskDataId)
      : undefined;

  const options: AxiosRequestConfig = {};
  if (isStateless && !allowAnonymous && currentPartyId) {
    options.headers = {
      party: `partyid:${currentPartyId}`,
    };
  }

  // We also add the current task id to the query key, so that the query is refetched when the task changes. This
  // is needed because we have logic waiting for the form data to be fetched before we can continue (even if the
  // data element used is the same one between two different tasks - in which case it could also have been changed
  // on the server).
  const currentTaskId = instance?.process?.currentTask?.elementId;

  useEffect(() => {
    if (isEnabled && url !== undefined) {
      dispatch(FormDataActions.fetchPending({ url }));
    }
  }, [dispatch, isEnabled, url]);

  const { fetchFormData } = useAppQueries();
  const out = useQuery(['fetchFormData', url, currentTaskId], () => fetchFormData(url || '', options), {
    enabled: isEnabled && url !== undefined,
    onSuccess: (formDataAsObj) => {
      const formData = convertModelToDataBinding(formDataAsObj);
      dispatch(FormDataActions.fetchFulfilled({ formData, url }));
      dispatch(FormRulesActions.fetch());
      dispatch(FormDynamicsActions.fetch());
    },
    onError: async (error: HttpClientError) => {
      dispatch(FormDataActions.fetchRejected({ error }));
      dispatch(QueueActions.dataTaskQueueError({ error }));
      if (error.message?.includes('403')) {
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

  if (reFetchActive && !out.isFetching) {
    out.refetch().then();
  }

  return out;
}
