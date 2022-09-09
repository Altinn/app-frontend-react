import React from 'react';

import {
  useAppSelector,
  useInstanceIdParams,
  useProcess,
} from 'src/common/hooks';
import { useApiErrorCheck } from 'src/common/hooks/useApiErrorCheck';
import UnknownError from 'src/features/instantiate/containers/UnknownError';
import { ProcessComponent } from 'src/shared/components/ProcessComponent';
import Presentation from 'src/shared/containers/Presentation';
import { InstanceDataActions } from 'src/shared/resources/instanceData/instanceDataSlice';

import {
  AltinnContentIconFormData,
  AltinnContentLoader,
} from 'altinn-shared/components';

const ProcessWrapper = () => {
  const instantiating = useAppSelector(
    (state) => state.instantiation.instantiating,
  );
  const isLoading = useAppSelector((state) => state.isLoading.dataTask);
  const { hasApiErrors } = useApiErrorCheck();
  const { dispatch, process, appOwner, appName } = useProcess();
  const { taskType } = process;

  const instanceId = useAppSelector((state) => state.instantiation.instanceId);
  const instanceIdFromUrl = useInstanceIdParams()?.instanceId;
  window['instanceId'] = instanceIdFromUrl;

  React.useEffect(() => {
    if (!instantiating && !instanceId) {
      dispatch(
        InstanceDataActions.get({
          instanceId: instanceIdFromUrl,
        }),
      );
    }
  }, [instantiating, instanceId, dispatch, instanceIdFromUrl]);
  if (hasApiErrors) {
    return <UnknownError />;
  }

  if (!process?.taskType) {
    return null;
  }
  return (
    <Presentation
      header={appName}
      appOwner={appOwner}
      type={taskType}
    >
      <ProcessComponent
        taskType={taskType}
        loading={isLoading}
      />
      {isLoading && (
        <div style={{ marginTop: '2.5rem' }}>
          <AltinnContentLoader
            width='100%'
            height={700}
          >
            <AltinnContentIconFormData />
          </AltinnContentLoader>
        </div>
      )}
    </Presentation>
  );
};

export default ProcessWrapper;
