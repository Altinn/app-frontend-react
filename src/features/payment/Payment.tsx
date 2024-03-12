import React from 'react';

import { Button } from '@digdir/design-system-react';
import { useQuery } from '@tanstack/react-query';

import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { ConfirmButton } from 'src/features/processEnd/confirm/components/ConfirmButton';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { fetchPaymentInfo } from 'src/queries/queries';
export const Payment: React.FunctionComponent = () => {
  const { partyId, instanceGuid } = useInstanceIdParams();
  const instanceId = useLaxInstanceData()?.id;
  const paymentInfoQuery = useQuery({
    queryKey: ['fetchPaymentInfo', partyId, instanceGuid],
    queryFn: () => {
      if (partyId) {
        return fetchPaymentInfo(partyId, instanceGuid);
      }
    },
    enabled: !!partyId && !!instanceGuid,
  });

  return (
    <div>
      <h1>welcome to payment</h1>
      {`instanceGuid: ${instanceGuid}`}
      <br />
      {`instanceId: ${instanceId}`}
      <ul>
        <li>fetch payment info from api</li>
        <li>View the info</li>
      </ul>

      {paymentInfoQuery.isFetched && paymentInfoQuery.data?.status === 'Paid' && <h1>You have paid!</h1>}
      {paymentInfoQuery.isFetched && paymentInfoQuery.data?.status !== 'Paid' && (
        <Button asChild>
          <a href={paymentInfoQuery.data?.redirectUrl}>Pay!</a>
        </Button>
      )}
      {paymentInfoQuery.isFetched && paymentInfoQuery.data?.status === 'Paid' && (
        <ConfirmButton nodeId={'confirm-button'} />
      )}
    </div>
  );
};
