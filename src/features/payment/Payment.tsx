import React, { useEffect } from 'react';

import { Alert, Button, Heading } from '@digdir/design-system-react';

import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/features/payment/Payment.module.css';
import { SkeletonLoader } from 'src/features/payment/SkeletonLoader';
import { usePaymentInformationQuery } from 'src/features/payment/usePaymentInformationQuery';
import { usePerformPayActionMutation } from 'src/features/payment/usePerformPaymentMutation';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';
export const Payment: React.FunctionComponent = () => {
  const { partyId, instanceGuid } = useInstanceIdParams();
  const { next } = useProcessNavigation() || {};

  const { data: paymentInfoQuery, isFetched } = usePaymentInformationQuery(partyId, instanceGuid);

  const performPayActionMutation = usePerformPayActionMutation(partyId, instanceGuid);
  const { mutate: performPayment } = performPayActionMutation;

  useEffect(() => {
    // if no paymentDetails exists, the payment has not been initiated, initiate it by calling the pay action
    if (isFetched && !paymentInfoQuery?.paymentDetails) {
      performPayment();
    }
  }, [performPayment, paymentInfoQuery?.paymentDetails, isFetched]);

  return (
    <>
      {isFetched && !paymentInfoQuery?.paymentDetails ? (
        <SkeletonLoader />
      ) : (
        <PaymentDetailsTable
          orderDetails={paymentInfoQuery?.orderDetails}
          tableTitle={
            <Heading
              level={2}
              size='medium'
            >
              <Lang id='payment.summary' />
            </Heading>
          }
          className={classes.container}
        />
      )}
      <div className={classes.container}>
        {isFetched && paymentInfoQuery?.paymentDetails?.status === 'Failed' && (
          <Alert severity='warning'>
            <Lang id='payment.alert.failed' />
          </Alert>
        )}
        {isFetched && paymentInfoQuery?.paymentDetails?.status === 'Paid' && (
          <Alert severity={'info'}>
            <Lang id='payment.alert.paid' />
          </Alert>
        )}
      </div>
      {isFetched && paymentInfoQuery?.paymentDetails && (
        <div className={classes.buttonContainer}>
          {paymentInfoQuery?.paymentDetails?.status !== 'Paid' ? (
            <>
              <Button
                variant='secondary'
                onClick={() => next && next({ action: 'reject', nodeId: 'reject-button' })}
              >
                <Lang id='general.back' />
              </Button>
              <Button
                color='success'
                onClick={() => performPayment()}
              >
                <Lang id='payment.pay' />
              </Button>
            </>
          ) : (
            <Button
              variant='secondary'
              onClick={() => next && next({ action: 'confirm', nodeId: 'next-button' })}
            >
              <Lang id='general.next' />
            </Button>
          )}
        </div>
      )}
    </>
  );
};
