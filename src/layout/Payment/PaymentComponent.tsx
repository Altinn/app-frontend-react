import React, { useEffect } from 'react';

import { Alert, Button } from '@digdir/design-system-react';

import type { PropsFromGenericComponent } from '..';

import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import classes from 'src/layout/Payment/PaymentComponent.module.css';
import { PaymentStatus } from 'src/layout/Payment/queries/types';
import { usePaymentInformationQuery } from 'src/layout/Payment/queries/usePaymentInformationQuery';
import { usePerformPayActionMutation } from 'src/layout/Payment/queries/usePerformPaymentMutation';
import { SkeletonLoader } from 'src/layout/Payment/SkeletonLoader/SkeletonLoader';
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
  const { title, description } = node.item.textResourceBindings;

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
          tableTitle={title}
          description={description}
          className={classes.container}
        />
      }
      <div className={classes.container}>
        {paymentInfo?.paymentDetails?.status === PaymentStatus.Failed && (
          <Alert severity='warning'>
            <Lang id='payment.alert.failed' />
          </Alert>
        )}
        {paymentInfo?.paymentDetails?.status === PaymentStatus.Paid && (
          <Alert severity={'info'}>
            <Lang id='payment.alert.paid' />
          </Alert>
        )}
      </div>
      {paymentInfo?.paymentDetails && (
        <div className={classes.buttonContainer}>
          {paymentInfo?.paymentDetails?.status !== PaymentStatus.Paid ? (
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
