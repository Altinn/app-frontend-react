import React, { createContext, useCallback, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

import type { AxiosError } from 'axios';

import { useIsProcessing } from 'src/core/contexts/processingContext';
import { Loader } from 'src/core/loading/Loader';
import { useProcessNext } from 'src/features/instance/useProcessNext';
import { usePaymentInformation } from 'src/features/payment/PaymentInformationProvider';
import { PaymentStatus } from 'src/features/payment/types';
import { usePerformPayActionMutation } from 'src/features/payment/usePerformPaymentMutation';
import { useIsPayment } from 'src/features/payment/utils';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useIsPdf } from 'src/hooks/useIsPdf';
import { useShallowMemo } from 'src/hooks/useShallowMemo';

type PaymentContextProps = {
  performPayment: () => void;
  skipPayment: () => void;
  paymentError: AxiosError | null;
};

type PaymentContextProvider = {
  children: ReactNode;
};

export const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export const PaymentProvider: React.FC<PaymentContextProvider> = ({ children }) => {
  const { performProcess, isThisProcessing: isLoading } = useIsProcessing();
  const instanceOwnerPartyId = useNavigationParam('instanceOwnerPartyId');
  const instanceGuid = useNavigationParam('instanceGuid');
  const { mutateAsync, error: paymentError } = usePerformPayActionMutation(instanceOwnerPartyId, instanceGuid);
  const processNext = useProcessNext();

  const performPayment = useCallback(() => performProcess(() => mutateAsync()), [mutateAsync, performProcess]);

  const skipPayment = useCallback(
    () => performProcess(() => processNext({ action: 'confirm' })),
    [processNext, performProcess],
  );

  const contextValue = useShallowMemo({ performPayment, skipPayment, paymentError });

  if (isLoading) {
    return <Loader reason='Navigating to external payment solution' />;
  }

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
      {!paymentError && <PaymentNavigation />}
    </PaymentContext.Provider>
  );
};

function PaymentNavigation() {
  const paymentInfo = usePaymentInformation();
  const isPdf = useIsPdf();
  const { isAnyProcessing } = useIsProcessing();
  const { performPayment, skipPayment } = usePayment();

  const paymentDoesNotExist = paymentInfo?.status === PaymentStatus.Uninitialized;
  const isPaymentProcess = useIsPayment();

  // If when landing on payment task, PaymentStatus is Uninitialized, initiate it by calling the pay action and
  // go to payment provider
  useEffect(() => {
    if (isPaymentProcess && paymentDoesNotExist && !isAnyProcessing && !isPdf) {
      performPayment();
    }
  }, [isPaymentProcess, paymentDoesNotExist, performPayment, isPdf, isAnyProcessing]);

  const paymentCompleted = paymentInfo?.status === PaymentStatus.Paid || paymentInfo?.status === PaymentStatus.Skipped;

  // If when landing on payment task, PaymentStatus is Paid or Skipped, go to next task
  useEffect(() => {
    if (isPaymentProcess && paymentCompleted && !isAnyProcessing && !isPdf) {
      skipPayment();
    }
  }, [paymentCompleted, isPdf, skipPayment, isAnyProcessing, isPaymentProcess]);

  return null;
}

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
