import React from 'react';

import { Alert } from '@digdir/designsystemet-react';

import { Button } from 'src/app-components/Button/Button';
import { useIsProcessing } from 'src/core/contexts/processingContext';
import { useProcessNext } from 'src/features/instance/useProcessNext';
import { useProcessQuery } from 'src/features/instance/useProcessQuery';
import { Lang } from 'src/features/language/Lang';
import { usePaymentInformation } from 'src/features/payment/PaymentInformationProvider';
import { usePayment } from 'src/features/payment/PaymentProvider';
import { PaymentStatus } from 'src/features/payment/types';
import { useIsSubformPage } from 'src/hooks/navigation';
import { useNavigateToTask } from 'src/hooks/useNavigatePage';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/Payment/PaymentComponent.module.css';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const PaymentComponent = ({ baseComponentId }: PropsFromGenericComponent<'Payment'>) => {
  const { mutate: processConfirm, isPending: isConfirming } = useProcessNext({ action: 'confirm' });
  const { mutate: processReject, isPending: isRejecting } = useProcessNext({ action: 'reject' });
  const { isAnyProcessing } = useIsProcessing<'next' | 'reject'>();
  const paymentInfo = usePaymentInformation();
  const { performPayment, paymentError } = usePayment();
  const { title, description } = useItemWhenType(baseComponentId, 'Payment').textResourceBindings ?? {};
  const processQuery = useProcessQuery();
  const currentTaskId = processQuery.data?.currentTask?.elementId;
  const navigateToTask = useNavigateToTask();

  if (useIsSubformPage()) {
    throw new Error('Cannot use PaymentComponent in a subform');
  }

  const [isChecking, setIsChecking] = React.useState(false);
  const disabled = isAnyProcessing || isConfirming || isRejecting || isChecking;

  const handleNextClick = async () => {
    if (paymentInfo?.status !== PaymentStatus.Paid) {
      return;
    }

    setIsChecking(true);
    try {
      const { data: freshProcess } = await processQuery.refetch();
      const freshTaskId = freshProcess?.currentTask?.elementId;

      if (freshTaskId && freshTaskId !== currentTaskId) {
        // backend has moved the process, navigate there
        navigateToTask(freshTaskId);
        return;
      }

      // still on the same task, attempt to move to the next task
      processConfirm();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <ComponentStructureWrapper baseComponentId={baseComponentId}>
      <div className={classes.paymentContainer}>
        <PaymentDetailsTable
          orderDetails={paymentInfo?.orderDetails}
          tableTitle={title}
          description={description}
        />
        <div className={classes.alertContainer}>
          {(paymentInfo?.status === PaymentStatus.Failed || paymentError) && (
            <Alert data-color='warning'>
              <Lang id='payment.alert.failed' />
            </Alert>
          )}
          {paymentInfo?.status === PaymentStatus.Paid && (
            <Alert data-color='info'>
              <Lang id='payment.alert.paid' />
            </Alert>
          )}
        </div>
        <div className={classes.buttonContainer}>
          {(paymentInfo?.status === PaymentStatus.Created || paymentError) && (
            <>
              <Button
                variant='secondary'
                disabled={disabled}
                isLoading={isRejecting}
                onClick={() => processReject()}
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
              disabled={disabled}
              isLoading={isConfirming}
              onClick={handleNextClick}
            >
              <Lang id='general.next' />
            </Button>
          )}
        </div>
      </div>
    </ComponentStructureWrapper>
  );
};
