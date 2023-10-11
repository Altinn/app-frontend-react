import { useLastMutationResult } from 'src/contexts/appQueriesContext';
import { useCurrentLayoutSetId } from 'src/features/form/layout/useCurrentLayoutSetId';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useRealTaskType } from 'src/features/instance/useProcess';
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

export function useStatelessReadyState(): StatelessReadyState {
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata?.applicationMetadata);
  const allowAnonymousSelector = makeGetAllowAnonymousSelector();
  const allowAnonymous = useAppSelector(allowAnonymousSelector);
  const partyValidation = useLastMutationResult('doPartyValidation');
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);

  const currentLayoutSetId = useCurrentLayoutSetId();
  const dynamicsFetchedFor = useAppSelector((state) => state.formDynamics.fetchedForLayoutSet);
  const rulesFetchedFor = useAppSelector((state) => state.formRules.fetchedForLayoutSet);

  if (!isStatelessApp(applicationMetadata)) {
    return StatelessReadyState.NotStateless;
  }

  const isReady = allowAnonymous || partyValidation?.valid;
  if (!isReady) {
    return StatelessReadyState.NotReady;
  }

  if (!layoutSets) {
    // We're loading, but layout-sets are loaded automatically using tanstack query. So we don't need to trigger,
    // loading, and can just wait until the query is done. Layout-sets are required for stateless apps.
    return StatelessReadyState.Loading;
  }

  const dynamicsLoaded = currentLayoutSetId === dynamicsFetchedFor;
  const rulesLoaded = currentLayoutSetId === rulesFetchedFor;
  if (!dynamicsLoaded || !rulesLoaded) {
    return StatelessReadyState.Loading;
  }

  return StatelessReadyState.Ready;
}

function useDataTaskIsLoading() {
  const currentTaskId = useLaxInstanceData()?.process?.currentTask?.elementId;
  const formDataPending = useAppSelector((state) => state.formData.pendingUrl);
  const attachmentMappingPending = useAppSelector((state) => state.attachments.pendingMapping);
  const rulesLoadedFor = useAppSelector((state) => state.formRules.fetchedForTaskId);
  const dynamicsFetchedFor = useAppSelector((state) => state.formDynamics.fetchedForLayoutSet);
  const currentLayoutSetId = useCurrentLayoutSetId();

  return (
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
