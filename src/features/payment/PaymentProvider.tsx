import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

import type { AxiosError } from 'axios';

import { Loader } from 'src/core/loading/Loader';
import { useProcessNext } from 'src/features/instance/useProcessNext';
import { useProcessQuery } from 'src/features/instance/useProcessQuery';
import { usePaymentInformation } from 'src/features/payment/PaymentInformationProvider';
import { PaymentStatus } from 'src/features/payment/types';
import { usePerformPayActionMutation } from 'src/features/payment/usePerformPaymentMutation';
import { useIsPayment } from 'src/features/payment/utils';
import { useNavigationParam } from 'src/hooks/navigation';
import { useIsPdf } from 'src/hooks/useIsPdf';
import { useNavigateToTask } from 'src/hooks/useNavigatePage';
import { useOurEffectEvent } from 'src/hooks/useOurEffectEvent';
import { useShallowMemo } from 'src/hooks/useShallowMemo';

type PaymentContextProps = {
  performPayment: () => void;
  paymentError: AxiosError | null;
};

type PaymentContextProvider = {
  children: ReactNode;
};

export const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

// Module-level tracking to prevent duplicate payment calls across component remounts
const paymentInitiatedForInstance = new Map<string, boolean>();

export const PaymentProvider: React.FC<PaymentContextProvider> = ({ children }) => {
  const instanceOwnerPartyId = useNavigationParam('instanceOwnerPartyId');
  const instanceGuid = useNavigationParam('instanceGuid');
  const {
    mutateAsync,
    error: paymentError,
    isPending: isPaymentPending,
  } = usePerformPayActionMutation(instanceOwnerPartyId, instanceGuid);
  const { isPending: isConfirmPending } = useProcessNext({ action: 'confirm' });

  const isLoading = isPaymentPending || isConfirmPending;

  const performPayment = useOurEffectEvent(() => mutateAsync());

  const contextValue = useShallowMemo({ performPayment, paymentError });

  return (
    <PaymentContext.Provider value={contextValue}>
      {isLoading ? <Loader reason='Navigating to external payment solution' /> : children}
      {!paymentError && <PaymentNavigation />}
    </PaymentContext.Provider>
  );
};

function PaymentNavigation() {
  const paymentInfo = usePaymentInformation();
  const isPdf = useIsPdf();
  const { performPayment, paymentError } = usePayment();
  const instanceGuid = useNavigationParam('instanceGuid');

  const paymentDoesNotExist = paymentInfo?.status === PaymentStatus.Uninitialized;
  const isPaymentProcess = useIsPayment();

  const processQuery = useProcessQuery();
  const currentTaskId = processQuery.data?.currentTask?.elementId;
  const navigateToTask = useNavigateToTask();

  // If when landing on payment task, PaymentStatus is Uninitialized, initiate it by calling the pay action and
  // go to payment provider
  useEffect(() => {
    if (isPaymentProcess && paymentDoesNotExist && !isPdf && instanceGuid) {
      // Check module-level map to prevent duplicate calls across remounts
      if (!paymentInitiatedForInstance.get(instanceGuid)) {
        paymentInitiatedForInstance.set(instanceGuid, true);
        performPayment();
      }
    } else if (
      instanceGuid &&
      paymentInfo?.status !== undefined &&
      paymentInfo.status !== PaymentStatus.Uninitialized
    ) {
      // Clean up the flag once payment status is known and no longer Uninitialized
      paymentInitiatedForInstance.delete(instanceGuid);
    }
  }, [isPaymentProcess, paymentDoesNotExist, performPayment, isPdf, instanceGuid, paymentInfo?.status]);

  useEffect(() => {
    console.log('PaymentComponent useEffect - checking payment status', {
      paymentStatus: paymentInfo?.status,
      paymentError,
    });
    if (paymentInfo?.status === PaymentStatus.Paid && !paymentError) {
      console.log('PaymentComponent useEffect - payment is marked as paid, verifying process status');
      const handleFreshProcess = async () => {
        try {
          console.log('PaymentComponent useEffect - refetching process to check for task updates');
          const { data: freshProcess } = await processQuery.refetch();
          const freshTaskId = freshProcess?.currentTask?.elementId;

          if (freshTaskId && freshTaskId !== currentTaskId) {
            // backend has moved the process, navigate there
            console.log('PaymentComponent useEffect - process has moved to a new task, navigating', { freshTaskId });
            navigateToTask(freshTaskId);
          }
          console.log('PaymentComponent useEffect - process is still on the same task after payment');
        } finally {
          console.log('PaymentComponent useEffect - finished checking process status');
        }
      };
      handleFreshProcess();
    }
  }, [paymentInfo?.status, paymentError, processQuery, navigateToTask, currentTaskId]);

  return null;
}

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
