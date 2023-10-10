import { useLastMutationResult } from 'src/contexts/appQueriesContext';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useRealTaskType } from 'src/features/instance/useProcess';
import { useCurrentLayoutSetId } from 'src/features/layout/useCurrentLayoutSetId';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';
import { ProcessTaskType } from 'src/types';
import { isStatelessApp } from 'src/utils/appMetadata';

export enum StatelessReadyState {
  // Returned if the app is not stateless
  NotStateless,

  // Returned if the app is stateless, but the party is not valid (yet)
  NotReady,

  // Returned if the app is stateless, the party is valid, but the data is not loaded yet
  Loading,

  // Returned if the app is stateless, the party is valid, and the data is loaded
  Ready,
}

export function useStatelessReadyState(_triggerLoading?: () => void): StatelessReadyState {
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata?.applicationMetadata);
  const allowAnonymousSelector = makeGetAllowAnonymousSelector();
  const allowAnonymous = useAppSelector(allowAnonymousSelector);
  const partyValidation = useLastMutationResult('doPartyValidation');

  if (!isStatelessApp(applicationMetadata)) {
    return StatelessReadyState.NotStateless;
  }

  const isReady = allowAnonymous || partyValidation?.valid;
  if (!isReady) {
    return StatelessReadyState.NotReady;
  }

  // if (statelessLoading === null || statelessLoading) {
  //   triggerLoading && triggerLoading();
  //   return StatelessReadyState.Loading;
  // }

  return StatelessReadyState.Ready;
}

function useDataTaskIsLoading() {
  const currentTaskId = useLaxInstanceData()?.process?.currentTask?.elementId;
  const layoutsLoadedFor = useAppSelector((state) => state.formLayout.fetchedTaskId);
  const layoutSettingsLoadedFor = useAppSelector((state) => state.formLayout.uiConfig.fetchedSettingsFor);
  const formDataPending = useAppSelector((state) => state.formData.pendingUrl);
  const attachmentMappingPending = useAppSelector((state) => state.attachments.pendingMapping);
  const rulesLoadedFor = useAppSelector((state) => state.formRules.fetchedForTaskId);
  const dynamicsFetchedFor = useAppSelector((state) => state.formDynamics.fetchedForLayoutSet);
  const currentLayoutSetId = useCurrentLayoutSetId();

  return (
    currentTaskId !== layoutsLoadedFor ||
    currentTaskId !== layoutSettingsLoadedFor ||
    formDataPending !== undefined ||
    attachmentMappingPending ||
    currentTaskId !== rulesLoadedFor ||
    currentLayoutSetId !== dynamicsFetchedFor
  );
}

export function useIsLoading() {
  const stateless = useStatelessReadyState();
  const dataTaskIsLoading = useDataTaskIsLoading();
  const realTaskType = useRealTaskType();

  if (stateless !== StatelessReadyState.NotStateless) {
    return stateless !== StatelessReadyState.Ready;
  }

  return realTaskType === ProcessTaskType.Data && dataTaskIsLoading;
}
