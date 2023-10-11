import React from 'react';

import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { FormDynamicsActions } from 'src/features/form/dynamics/formDynamicsSlice';
import { useCurrentLayoutSetId } from 'src/features/form/layout/useCurrentLayoutSetId';
import { Loader } from 'src/features/isLoading/Loader';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { createStrictContext } from 'src/utils/createContext';

const { Provider } = createStrictContext<undefined>();

function useDynamicsQuery() {
  const dispatch = useAppDispatch();
  const { fetchDynamics } = useAppQueries();
  const layoutSetId = useCurrentLayoutSetId();

  return useQuery(['fetchDynamics', layoutSetId], () => fetchDynamics(layoutSetId), {
    onSuccess: (dynamics) => {
      if (dynamics) {
        dispatch(FormDynamicsActions.fetchFulfilled(dynamics.data));
      } else {
        dispatch(FormDynamicsActions.fetchRejected({ error: null }));
      }
    },
    onError: (error: AxiosError) => {
      dispatch(QueueActions.dataTaskQueueError({ error }));
      dispatch(FormDynamicsActions.fetchRejected({ error }));
      window.logError('Fetching dynamics failed:\n', error);
    },
  });
}

export function DynamicsProvider({ children }: React.PropsWithChildren) {
  const query = useDynamicsQuery();

  if (!query.data || query.isFetching) {
    return <Loader reason='form-dynamics' />;
  }

  return <Provider value={undefined}>{children}</Provider>;
}
