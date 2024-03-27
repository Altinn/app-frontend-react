import React, { useEffect } from 'react';

import { Alert, Button, Heading } from '@digdir/design-system-react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import classes from 'src/features/payment/Payment.module.css';
import { SkeletonLoader } from 'src/features/payment/SkeletonLoader';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';
import { fetchPaymentInfo } from 'src/queries/queries';
export const Payment: React.FunctionComponent = () => {
  const { partyId, instanceGuid } = useInstanceIdParams();
  const { doPerformAction } = useAppMutations();
  const { next } = useProcessNavigation() || {};

  const paymentInfoQuery = useQuery({
    queryKey: ['fetchPaymentInfo', partyId, instanceGuid],
    queryFn: () => {
      if (partyId) {
        return fetchPaymentInfo(partyId, instanceGuid);
      }
    },
    enabled: !!partyId && !!instanceGuid,
  });

  const performPayActionMutation = useMutation({
    mutationKey: ['performPayAction', partyId, instanceGuid],
    mutationFn: async () => {
      if (partyId) {
        return await doPerformAction(partyId, instanceGuid, { action: 'pay' });
      }
    },
    onSuccess: (data) => {
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    },
  });

  const { mutate: performPayment } = performPayActionMutation;

  useEffect(() => {
    // if no paymentDetails exists, the payment has not been initiated, initiate it by calling the pay action
    if (paymentInfoQuery.isFetched && !paymentInfoQuery.data?.paymentDetails) {
      performPayment();
    }
  }, [performPayment, paymentInfoQuery.data?.paymentDetails, paymentInfoQuery.isFetched]);

  return (
    <>
      {paymentInfoQuery.isFetched && !paymentInfoQuery.data?.paymentDetails ? (
        <SkeletonLoader />
      ) : (
        <PaymentDetailsTable
          orderDetails={paymentInfoQuery.data?.orderDetails}
          tableTitle={
            <Heading
              level={2}
              size='medium'
            >
              Summary
            </Heading>
          }
          className={classes.container}
        />
      )}
      <div className={classes.container}>
        {paymentInfoQuery.isFetched && paymentInfoQuery.data?.paymentDetails?.status === 'Failed' && (
          <Alert severity='warning'>Your payment has failed</Alert>
        )}
        {paymentInfoQuery.isFetched && paymentInfoQuery.data?.paymentDetails?.status === 'Paid' && (
          <Alert severity={'info'}>You have paid!</Alert>
        )}
      </div>
      {paymentInfoQuery.isFetched && paymentInfoQuery.data?.paymentDetails && (
        <div className={classes.buttonContainer}>
          {paymentInfoQuery.data?.paymentDetails?.status !== 'Paid' ? (
            <>
              <Button
                variant='secondary'
                onClick={() => next && next({ action: 'reject', nodeId: 'reject-button' })}
              >
                Back
              </Button>
              <Button
                color='success'
                onClick={() => performPayment()}
              >
                Pay!
              </Button>
            </>
          ) : (
            <Button
              variant='secondary'
              onClick={() => next && next({ action: 'confirm', nodeId: 'next-button' })}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </>
  );
};
