import React from 'react';

import { Alert } from '@digdir/designsystemet-react';
import { useMutation } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { useProcessNext } from 'src/features/instance/useProcessNext';
import { Lang } from 'src/features/language/Lang';
import { usePaymentInformation } from 'src/features/payment/PaymentInformationProvider';
import { usePayment } from 'src/features/payment/PaymentProvider';
import { PaymentStatus } from 'src/features/payment/types';
import { useIsSubformPage } from 'src/features/routing/AppRoutingContext';
import { useHasLongLivedMutations } from 'src/hooks/useHasLongLivedMutations';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/Payment/PaymentComponent.module.css';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const PaymentComponent = ({ node }: PropsFromGenericComponent<'Payment'>) => {
  const { processNext } = useProcessNext();
  const hasLongLivedMutations = useHasLongLivedMutations();

  const paymentInfo = usePaymentInformation();
  const { performPayment, paymentError } = usePayment();
  const { title, description } = useNodeItem(node, (i) => i.textResourceBindings) ?? {};

  if (useIsSubformPage()) {
    throw new Error('Cannot use PaymentComponent in a subform');
  }

  const { mutate: handleReject, isPending: isRejecting } = useMutation({
    mutationFn: async () => await processNext({ action: 'reject' }),
  });

  const { mutate: handleNext, isPending: isConfirming } = useMutation({
    mutationFn: async () => await processNext({ action: 'confirm' }),
  });

  return (
    <ComponentStructureWrapper node={node}>
      <div className={classes.paymentContainer}>
        <PaymentDetailsTable
          orderDetails={paymentInfo?.orderDetails}
          tableTitle={title}
          description={description}
        />
        <div className={classes.alertContainer}>
          {(paymentInfo?.status === PaymentStatus.Failed || paymentError) && (
            <Alert severity='warning'>
              <Lang id='payment.alert.failed' />
            </Alert>
          )}
          {paymentInfo?.status === PaymentStatus.Paid && (
            <Alert severity='info'>
              <Lang id='payment.alert.paid' />
            </Alert>
          )}
        </div>
        <div className={classes.buttonContainer}>
          {(paymentInfo?.status === PaymentStatus.Created || paymentError) && (
            <>
              <Button
                variant='secondary'
                disabled={hasLongLivedMutations}
                isLoading={isRejecting}
                onClick={() => handleReject()}
              >
                <Lang id='general.back' />
              </Button>
              <Button
                color='success'
                onClick={performPayment}
              >
                <Lang id='payment.pay' />
              </Button>
            </>
          )}
          {paymentInfo?.status === PaymentStatus.Paid && (
            <Button
              variant='secondary'
              disabled={hasLongLivedMutations}
              isLoading={isConfirming}
              onClick={() => handleNext()}
            >
              <Lang id='general.next' />
            </Button>
          )}
        </div>
      </div>
    </ComponentStructureWrapper>
  );
};
