import { useLastMutationResult } from 'src/contexts/appQueriesContext';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useRealTaskType } from 'src/features/instance/useProcess';
import { useCurrentLayoutSetId } from 'src/features/layout/useCurrentLayoutSetId';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
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

export function useStatelessReadyState(triggerLoading?: () => void): StatelessReadyState {
  const dispatch = useAppDispatch();

  const applicationMetadata = useAppSelector((state) => state.applicationMetadata?.applicationMetadata);
  const allowAnonymousSelector = makeGetAllowAnonymousSelector();
  const allowAnonymous = useAppSelector(allowAnonymousSelector);
  const partyValidation = useLastMutationResult('doPartyValidation');
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);

  const currentLayoutSetId = useCurrentLayoutSetId();
  const dynamicsFetchedFor = useAppSelector((state) => state.formDynamics.fetchedForLayoutSet);
  const rulesFetchedFor = useAppSelector((state) => state.formRules.fetchedForLayoutSet);
  const statelessWorking = useAppSelector((state) => state.queue.stateless.working);
  const isFetchingLayouts = useAppSelector((state) => state.formLayout.fetchingLayouts);
  const isFetchingLayoutSettings = useAppSelector((state) => state.formLayout.uiConfig.fetchingSettings);
  const layoutsFetchedFor = useAppSelector((state) => state.formLayout.fetchedLayoutSetId);
  const layoutSettingsFetchedFor = useAppSelector((state) => state.formLayout.uiConfig.fetchedSettingsForLayoutSetId);

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

  const layoutsLoaded = currentLayoutSetId === layoutsFetchedFor;
  const layoutSettingsLoaded = currentLayoutSetId === layoutSettingsFetchedFor;
  if (!isFetchingLayouts && !isFetchingLayoutSettings && !layoutsLoaded && !layoutSettingsLoaded) {
    triggerLoading && triggerLoading();
    return StatelessReadyState.Loading;
  }

  const dynamicsLoaded = currentLayoutSetId === dynamicsFetchedFor;
  const rulesLoaded = currentLayoutSetId === rulesFetchedFor;
  if (!dynamicsLoaded || !rulesLoaded || !layoutsLoaded || !layoutSettingsLoaded) {
    return StatelessReadyState.Loading;
  }

  if (statelessWorking) {
    // We're working, but we're not loading anything. This means we're actually finished loading and can tell
    // that to the queue.
    dispatch(QueueActions.finishInitialStatelessQueue());
    return StatelessReadyState.Ready;
  }

  return StatelessReadyState.Ready;
}

function useDataTaskIsLoading() {
  const currentTaskId = useLaxInstanceData()?.process?.currentTask?.elementId;
  const layoutsLoadedFor = useAppSelector((state) => state.formLayout.fetchedTaskId);
  const layoutSettingsLoadedFor = useAppSelector((state) => state.formLayout.uiConfig.fetchedSettingsForTaskId);
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
