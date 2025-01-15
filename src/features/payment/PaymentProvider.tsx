import React, { createContext, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { AxiosError } from 'axios';

import { Loader } from 'src/core/loading/Loader';
import { usePaymentInformation } from 'src/features/payment/PaymentInformationProvider';
import { PaymentStatus } from 'src/features/payment/types';
import { usePerformPayActionMutation } from 'src/features/payment/usePerformPaymentMutation';
import { useIsPayment } from 'src/features/payment/utils';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';

type PaymentContextProps = {
  setLoading: (bool) => void;
  performPayment: () => void;
  paymentError: AxiosError | null;
};

type PaymentContextProvider = {
  children: ReactNode;
};

export const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export const PaymentProvider: React.FC<PaymentContextProvider> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const partyId = useNavigationParam('partyId');
  const instanceGuid = useNavigationParam('instanceGuid');
  const paymentInfo = usePaymentInformation();
  const { mutate, error } = usePerformPayActionMutation(partyId, instanceGuid);

  const contextValue: PaymentContextProps = {
    setLoading,
    performPayment: () => {
      setLoading(true);
      mutate();
    },
    paymentError: error,
  };

  const paymentDoesNotExist = paymentInfo?.status === PaymentStatus.Uninitialized;
  const isPaymentProcess = useIsPayment();
  const actionCalled = useRef(false);

  if (isPaymentProcess && paymentDoesNotExist && !actionCalled.current) {
    actionCalled.current = true;
    setLoading(true);
    mutate();
  }

  if (loading) {
    return <Loader reason='Navigating to external payment solution' />;
  }

  return <PaymentContext.Provider value={contextValue}>{children}</PaymentContext.Provider>;
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
