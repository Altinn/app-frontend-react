import React from 'react';

import { Button } from '@digdir/design-system-react';
import { useQuery } from '@tanstack/react-query';

import { ConfirmButton } from 'src/features/processEnd/confirm/components/ConfirmButton';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { fetchPaymentInfo } from 'src/queries/queries';
export const Payment: React.FunctionComponent = () => {
  const { partyId, instanceGuid } = useInstanceIdParams();
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
      {paymentInfoQuery.data?.orderDetails?.orderLines?.length && (
        <ul>
          {paymentInfoQuery.data?.orderDetails.orderLines.map((orderLine, idx) => <li key={idx}>{orderLine.name}</li>)}
        </ul>
      )}

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
