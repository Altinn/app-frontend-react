import { useLastMutationResult } from 'src/contexts/appQueriesContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';
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

  if (!isStatelessApp(applicationMetadata)) {
    return StatelessReadyState.NotStateless;
  }

  const isReady = allowAnonymous || partyValidation?.valid;
  if (!isReady) {
    return StatelessReadyState.NotReady;
  }

  if (!layoutSets) {
    // Layout-sets are required for stateless apps.
    return StatelessReadyState.Loading;
  }

  return StatelessReadyState.Ready;
}

export function useIsLoading() {
  const stateless = useStatelessReadyState();

  if (stateless !== StatelessReadyState.NotStateless) {
    return stateless !== StatelessReadyState.Ready;
  }

  // TODO: Remove these two hooks. Everything should render the Loading component now, until their data is loaded.
  return false;
}
