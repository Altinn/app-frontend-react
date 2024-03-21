import React, { useEffect } from 'react';

import { Alert, Button, Heading, Skeleton } from '@digdir/design-system-react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import classes from 'src/features/payment/Payment.module.css';
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
    <div className={classes.paymentContainer}>
      {paymentInfoQuery.isFetched && !paymentInfoQuery.data?.paymentDetails ? (
        <div
          style={{
            width: '100%',
          }}
        >
          <Skeleton.Rectangle
            width='100%'
            height='150px'
          />
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              padding: '5px 0 5px 0',
            }}
          >
            <Skeleton.Circle
              width='30px'
              height='30px'
            />
            <Heading
              asChild
              size='medium'
            >
              <Skeleton.Text>En medium tittel</Skeleton.Text>
            </Heading>
          </div>
          <Skeleton.Text width='100%' />
          <Skeleton.Text width='100%' />
          <Skeleton.Text width='80%' />
        </div>
      ) : (
        <PaymentDetailsTable
          orderDetails={paymentInfoQuery.data?.orderDetails}
          title={'Summary'}
        />
      )}

      {paymentInfoQuery.isFetched && paymentInfoQuery.data?.paymentDetails?.status === 'Failed' && (
        <Alert severity='warning'>Your payment has failed</Alert>
      )}
      {paymentInfoQuery.isFetched && paymentInfoQuery.data?.paymentDetails?.status === 'Paid' && (
        <Alert severity={'info'}>You have paid!</Alert>
      )}
      <div className={classes.buttonContainer}>
        {paymentInfoQuery.isFetched && paymentInfoQuery.data?.paymentDetails && partyId && (
          <>
            {paymentInfoQuery.data?.paymentDetails?.status !== 'Paid' && (
              <>
                <Button
                  className={classes.payButton}
                  variant='secondary'
                  onClick={() => next && next({ action: 'reject', nodeId: 'reject-button' })}
                >
                  Back
                </Button>
                <Button
                  className={classes.payButton}
                  color='success'
                  onClick={() => performPayment()}
                >
                  Pay!
                </Button>
              </>
            )}

            {paymentInfoQuery.data?.paymentDetails?.status === 'Paid' && (
              <Button
                className={classes.payButton}
                variant='secondary'
                onClick={() => next && next({ nodeId: 'next-button' })}
              >
                Next
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
