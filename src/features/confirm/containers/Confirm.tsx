import React from 'react';

import { AltinnContentIconReceipt } from 'src/components/atoms/AltinnContentIconReceipt';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { ConfirmPage } from 'src/features/confirm/containers/ConfirmPage';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { selectAppName } from 'src/selectors/language';

export const Confirm = () => {
  const instance = useLaxInstanceData();
  const parties = useAppSelector((state) => state.party.parties);
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata.applicationMetadata);
  const appName = useAppSelector(selectAppName);

  const isLoading = !instance || !parties;
  return (
    <div id='confirmcontainer'>
      {isLoading ? (
        <AltinnContentLoader
          width={705}
          height={561}
        >
          <AltinnContentIconReceipt />
        </AltinnContentLoader>
      ) : (
        <ConfirmPage
          applicationMetadata={applicationMetadata}
          instance={instance}
          parties={parties}
          appName={appName}
        />
      )}
    </div>
  );
};
