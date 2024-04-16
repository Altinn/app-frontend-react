import React, { useEffect } from 'react';

import { Alert, Button, Heading } from '@digdir/design-system-react';

import type { PropsFromGenericComponent } from '..';

import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/features/payment/Payment.module.css';
import { SkeletonLoader } from 'src/features/payment/SkeletonLoader';
import { usePaymentInformationQuery } from 'src/features/payment/usePaymentInformationQuery';
import { usePerformPayActionMutation } from 'src/features/payment/usePerformPaymentMutation';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';

export type IPaymentProps = PropsFromGenericComponent<'Payment'>;

export const PaymentComponent = ({ node }) => {
  // Render these values in the receipt PDF:
  // From API:
  //   - Payment ID
  //   - Payment date
  //   - Order date
  //   - Masked card number, last 4 digits when card was used
  //   - Order details / line items
  //     - Total amount
  //     - currency
  // From the instance:
  //   - Order number / reference id
  // From configuration:
  //   - contact details

  const { partyId, instanceGuid } = useInstanceIdParams();
  const { next, busy } = useProcessNavigation() || {};
  const { data: paymentInfo, isFetched: isPaymentInformationFetched } = usePaymentInformationQuery(
    partyId,
    instanceGuid,
  );
  const performPayActionMutation = usePerformPayActionMutation(partyId, instanceGuid);
  const paymentDoesNotExist = isPaymentInformationFetched && !paymentInfo?.paymentDetails;

  // performPayActionMutation changes each render, so we need to destructure it to get the mutate function
  // which does not change and is safe to use in the useEffect dependency array
  const { mutate: performPayment } = performPayActionMutation;

  useEffect(() => {
    // if no paymentDetails exists, the payment has not been initiated, initiate it by calling the pay action
    if (paymentDoesNotExist) {
      performPayment();
    }
  }, [performPayment, paymentDoesNotExist]);

  if (busy || !isPaymentInformationFetched || paymentDoesNotExist) {
    return <SkeletonLoader />;
  }

  return (
    <>
      {
        <PaymentDetailsTable
          orderDetails={paymentInfo?.orderDetails}
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
      }
      <div className={classes.container}>
        {paymentInfo?.paymentDetails?.status === 'Failed' && (
          <Alert severity='warning'>
            <Lang id='payment.alert.failed' />
          </Alert>
        )}
        {paymentInfo?.paymentDetails?.status === 'Paid' && (
          <Alert severity={'info'}>
            <Lang id='payment.alert.paid' />
          </Alert>
        )}
      </div>
      {paymentInfo?.paymentDetails && (
        <div className={classes.buttonContainer}>
          {paymentInfo?.paymentDetails?.status !== 'Paid' ? (
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
